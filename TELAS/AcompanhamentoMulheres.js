import React, { useState, useEffect  } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Alert, BackHandler  } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { adicionarPontos } from './gamificationRules';
import auth from '@react-native-firebase/auth';

import { verificarConquista, incrementarContador, registrarConsulta} from './conquistasRules';

const AcompanhamentoMulheres = () => {

    const navigation = useNavigation();
    const route = useRoute();
    const { paciente } = route.params;

    const [dataPreventivo, setDataPreventivo] = useState('');
    const [dataResultadoPreventivo, setDataResultadoPreventivo] = useState('');

    // Estado para acumular todas as alterações pendentes
    const [pendingUpdates, setPendingUpdates] = useState({});

    const [contadorMulheres, setContadorMulheres] = useState(0);

    useFocusEffect(
        useCallback(() => {
          const backHandler = () => {
            confirmExit();
            return true; // Impede a navegação automática
          };
      
          const subscription = BackHandler.addEventListener('hardwareBackPress', backHandler);
      
          return () => subscription.remove();
        }, [hasUnsavedChanges, currentField])
    );

    // Intercepta o botão de voltar do Android para chamar `confirmExit`
    useEffect(() => {
        const backAction = () => {
        confirmExit();
        return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, [hasUnsavedChanges, pendingUpdates]);

    // Estado para monitorar o campo editado
    const [currentField, setCurrentField] = useState(null);

    // Estado para controlar se houve alguma alteração nos campos
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Função para monitorar alterações nos campos e registrar no objeto `pendingUpdates`
    const handleFieldChange = (newValue, setValue, fieldName, isDate = false) => {
        const formattedValue = isDate ? formatarData(newValue) : newValue;
        setValue(formattedValue);

        // Atualiza o estado com o campo modificado
        setPendingUpdates((prevUpdates) => ({
        ...prevUpdates,
        [fieldName]: newValue,
        }));

        setHasUnsavedChanges(true); // Indica que há mudanças não salvas
    };
    
    // Função para formatar a data conforme o usuário digita
    const formatarData = (text) => {
        // Remove todos os caracteres que não são números
        const textOnlyNumbers = text.replace(/\D/g, '');
    
        // Aplica a formatação de data (00/00/0000)
        if (textOnlyNumbers.length <= 2) {
            return textOnlyNumbers;
        } else if (textOnlyNumbers.length <= 4) {
            return `${textOnlyNumbers.slice(0, 2)}/${textOnlyNumbers.slice(2)}`;
        } else {
            return `${textOnlyNumbers.slice(0, 2)}/${textOnlyNumbers.slice(2, 4)}/${textOnlyNumbers.slice(4, 8)}`;
        }
    };

    // Função para exibir mensagem de confirmação
    const confirmExit = () => {
        if (hasUnsavedChanges) {
        Alert.alert(
            'Salvar Alterações?',
            'Você tem alterações não salvas. Deseja salvar antes de sair?',
            [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair sem salvar', onPress: () => navigation.goBack() },
            { text: 'Salvar', onPress: saveChanges },
            ],
        );
        } else {
        navigation.goBack();
        }
    };

    const saveChanges = async () => {
        if (Object.keys(pendingUpdates).length > 0) {
          console.log("Campos alterados (pendingUpdates):", pendingUpdates);
      
          try {
            // Cria um objeto para atualização no Firestore com a estrutura correta
            const updateData = Object.keys(pendingUpdates).reduce((acc, field) => {
              acc[`especificos.${field}`] = pendingUpdates[field];
              return acc;
            }, {});
      
            // Atualiza os dados do paciente no Firestore
            await firestore().collection('pacientes').doc(paciente.id).update(updateData);
      
            // 🔶 Regras de pontuação
            const pontosPorCampo = {
              dataPreventivo: 10, // Pontos pelo registro da data do preventivo
              dataResultadoPreventivo: 10, // Pontos pelo registro da data do resultado do preventivo
            };
      
            // Soma os pontos para todos os campos alterados
            const pontosGanhos = Object.keys(pendingUpdates).reduce((total, field) => {
              const pontos = pontosPorCampo[field] || 0; // Pontos do campo
              console.log(`Campo: ${field}, Pontos: ${pontos}`);
              return total + pontos;
            }, 0);
            console.log(`Total de pontos ganhos: ${pontosGanhos}`);
      
            // Atualiza os pontos no Firestore para o usuário ativo
            if (pontosGanhos > 0) {
              const userId = auth().currentUser?.uid; // Obtém o ID do usuário autenticado
              console.log("ID do usuário ativo:", userId);
              await adicionarPontos(userId, pontosGanhos);
            }
      
            // 🔶 Lógica de conquista (Defensores da Saúde Feminina)
            if (pendingUpdates.dataPreventivo || pendingUpdates.dataResultadoPreventivo) {
              const novoContador = incrementarContador(contadorMulheres); // Incrementa o contador localmente
              setContadorMulheres(novoContador); // Atualiza o estado localmente
      
              const resultadoConquista = await registrarConsulta(
                novoContador,
                setContadorMulheres,
                "Saúde Feminina"
              );
      
              if (resultadoConquista?.desbloqueada) {
                console.log("Conquista desbloqueada:", "Saúde Feminina");
                console.log("Pontos ganhos com a conquista:", resultadoConquista.pontos);
      
                const userId = auth().currentUser?.uid;
                await adicionarPontos(userId, resultadoConquista.pontos);
      
                Toast.show({
                  type: 'success',
                  text1: 'Parabéns!',
                  text2: `Você desbloqueou a conquista: "Saúde Feminina"!`,
                });
              }
            }
      
            // Resetando o estado de alterações pendentes
            setHasUnsavedChanges(false);
            setPendingUpdates({}); // Limpa as alterações pendentes após salvar
      
            Toast.show({
              type: 'success',
              text1: 'Sucesso',
              text2: 'Todas as alterações foram salvas com sucesso.',
            });
          } catch (error) {
            console.error('Erro ao salvar alterações:', error);
            Toast.show({
              type: 'error',
              text1: 'Erro',
              text2: 'Falha ao salvar alterações.',
            });
          }
        }
    };

    useEffect(() => {
        const loadPatientData = async () => {
          try {
            const patientDoc = await firestore().collection('pacientes').doc(paciente.id).get();
            const patientData = patientDoc.data();
      
            if (patientData && patientData.especificos) {
              const especificos = patientData.especificos;
      
              // Preenche os estados dos campos de acompanhamento de mulheres apenas se o dado existir
              setDataPreventivo(especificos.dataPreventivo || '');
              setDataResultadoPreventivo(especificos.dataResultadoPreventivo || '');
            }
          } catch (error) {
            console.error('Erro ao carregar dados do paciente:', error);
          }
        };
      
        loadPatientData();
      }, [paciente.id]);

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
      
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={confirmExit}>
                <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.title}>Acompanhamento</Text>
            </View>
            
            <View>
                <Text style={styles.patientName}>{paciente.nome}</Text>
                <Text style={styles.indicator}>Indicador: Mulheres</Text>
            </View>

            {/* Container para os campos */}
            <View style={styles.fieldsContainer}>
                {/* DUM */}
                <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Data da Realização do Preventivo</Text>
                <View style={styles.inputContainerWithIcon}>
                    <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
                    <TextInput
                        style={styles.inputFieldWithIcon}
                        keyboardType="numeric"
                        maxLength={10}
                        onChangeText={(text) => handleFieldChange(text, setDataPreventivo, 'dataPreventivo', true)}
                        value={dataPreventivo}
                        />
                </View>
                </View>

                {/* Idade G. Início */}
                <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Data do Resultado do Preventivo</Text>
                <View style={styles.inputContainerWithIcon}>
                    <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
                    <TextInput
                    style={styles.inputFieldWithIcon}
                    keyboardType="numeric"
                    maxLength={10}
                    onChangeText={(text) => handleFieldChange(text, setDataResultadoPreventivo, 'dataResultadoPreventivo', true)}
                    value={dataResultadoPreventivo}
                    />
                </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: '#fff',
      },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginBottom: 20,
        marginTop: 20,
      },
    backButton: {
        marginRight: 25,
      },
    backIcon: {
        width: 24,
        height: 24,
      },
    title: {
        fontSize: 22,
        fontFamily: 'Montserrat-Bold',
        color: '#000',
        marginLeft: 10,
      },
    patientName: {
        fontSize: 24,
        fontFamily: 'Montserrat-Bold',
        color: '#000',
        textAlign: 'center',
      },
    indicator: {
        fontSize: 18,
        fontFamily: 'Montserrat-Regular',
        color: '#000',
        textAlign: 'center',
        marginBottom: 20,
      },
    fieldsContainer: {
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 40,
      },
    fieldGroup: {
        marginHorizontal: 5,
      },
    fieldLabel: {
        fontSize: 14,
        fontFamily: 'Montserrat-SemiBold',
        marginBottom: 5,
        color: '#000',
        textAlign: 'center',
      },
    inputContainerWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0000AF',
        borderRadius: 25,
        paddingHorizontal: 10,
        height: 40,
        width: 300,
        marginBottom: 15,
      },
    iconInsideInput: {
        width: 20,
        height: 20,
        textAlign: 'center', // centraliza o texto dentro do campo
        marginRight: -10,
      },
    inputFieldWithIcon: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'Montserrat-Regular',
        color: "#000",
        borderWidth: 0, // Remove a borda extra
        paddingHorizontal: 10,
        paddingVertical: 5,
        textAlign: 'center',
      },
});

export default AcompanhamentoMulheres;
