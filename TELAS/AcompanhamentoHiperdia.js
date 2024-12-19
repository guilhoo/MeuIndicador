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

const AcompanhamentoHiperdia = () => {

    const navigation = useNavigation();
    const route = useRoute();
    const { paciente } = route.params;

    const [HaDia, setHaDia] = useState('');
    const [diagnostico, setDiagnostico] = useState('');
    const [insulina, setInsulina] = useState('');
    const [tipoInsulina, setTipoInsulina] = useState('');
    const [quantFrascos, setQuantFrascos] = useState('');
    const [primeiraPA, setPrimeiraPA] = useState('');
    const [hemoglobinaGlicada, setHemoglobinaGlicada] = useState('');

    // Estado para acumular todas as alterações pendentes
    const [pendingUpdates, setPendingUpdates] = useState({});

    // Estado para o contador da conquista "Monitor de Pressão"
    const [contadorPA, setContadorPA] = useState(0);

    // Estado para o contador da conquista "Combatente do Diabetes"
    const [contadorDiabetes, setContadorDiabetes] = useState(0);

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
              primeiraPA: 10, // Pontos pelo monitoramento de pressão arterial
              hemoglobinaGlicada: 10, // Pontos pelo controle de hemoglobina glicada
              diagnostico: 5,
              insulina: 5,
              tipoInsulina: 5,
              quantFrascos: 5,
              haDia: 5,
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
      
            // 🔶 Lógica de conquista (Monitor de Pressão)
            if (pendingUpdates.primeiraPA) {
              const novoContadorPA = incrementarContador(contadorPA); // Incrementa o contador localmente
              setContadorPA(novoContadorPA); // Atualiza o estado localmente
      
              const resultadoConquistaPA = await registrarConsulta(
                novoContadorPA,
                setContadorPA,
                "Monitor de Pressão"
              );
      
              if (resultadoConquistaPA?.desbloqueada) {
                console.log("Conquista desbloqueada:", "Monitor de Pressão");
                console.log("Pontos ganhos com a conquista:", resultadoConquistaPA.pontos);
      
                const userId = auth().currentUser?.uid;
                await adicionarPontos(userId, resultadoConquistaPA.pontos);
      
                Toast.show({
                  type: 'success',
                  text1: 'Parabéns!',
                  text2: `Você desbloqueou a conquista: "Monitor de Pressão"!`,
                });
              }
            }
      
            // 🔶 Lógica de conquista (Combatente do Diabetes)
            if (pendingUpdates.hemoglobinaGlicada) {
              const novoContadorDiabetes = incrementarContador(contadorDiabetes); // Incrementa o contador localmente
              setContadorDiabetes(novoContadorDiabetes); // Atualiza o estado localmente
      
              const resultadoConquistaDiabetes = await registrarConsulta(
                novoContadorDiabetes,
                setContadorDiabetes,
                "Combatente do Diabetes"
              );
      
              if (resultadoConquistaDiabetes?.desbloqueada) {
                console.log("Conquista desbloqueada:", "Combatente do Diabetes");
                console.log("Pontos ganhos com a conquista:", resultadoConquistaDiabetes.pontos);
      
                const userId = auth().currentUser?.uid;
                await adicionarPontos(userId, resultadoConquistaDiabetes.pontos);
      
                Toast.show({
                  type: 'success',
                  text1: 'Parabéns!',
                  text2: `Você desbloqueou a conquista: "Combatente do Diabetes"!`,
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
      
              // Preenche os estados dos campos de Hiperdia apenas se o dado existir
              setHaDia(especificos.haDia || '');
              setDiagnostico(especificos.diagnostico || '');
              setInsulina(especificos.insulina || '');
              setTipoInsulina(especificos.tipoInsulina || '');
              setQuantFrascos(especificos.quantFrascos || '');
              setPrimeiraPA(especificos.primeiraPA || '');
              setHemoglobinaGlicada(especificos.hemoglobinaGlicada || '');
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
                <Text style={styles.indicator}>Indicador: Hiperdia</Text>
            </View>

            <View style={styles.fieldsContainer}>
                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Ha, DIA ou Ambos?</Text>
                        <TextInput
                        style={styles.centeredInputField}
                        maxLength={10}
                        onChangeText={(text) => handleFieldChange(text, setHaDia, 'HaDia')}
                        value={HaDia}
                        />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Diagnóstico Certo?</Text>
                        <TextInput
                        style={styles.centeredInputField}
                        maxLength={10}
                        onChangeText={(text) => handleFieldChange(text, setDiagnostico, 'diagnostico')}
                        value={diagnostico}
                        />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Paciente Utiliza Insulina?</Text>
                        <TextInput
                        style={styles.centeredInputField}
                        maxLength={10}
                        onChangeText={(text) => handleFieldChange(text, setInsulina, 'insulina')}
                        value={insulina}
                        />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Tipo de Insulina?</Text>
                        <TextInput
                        style={styles.centeredInputField}
                        maxLength={10}
                        onChangeText={(text) => handleFieldChange(text, setTipoInsulina, 'tipoInsulina')}
                        value={tipoInsulina}
                        />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Quantidade de Frascos</Text>
                        <TextInput
                        style={styles.centeredInputField}
                        maxLength={10}
                        onChangeText={(text) => handleFieldChange(text, setQuantFrascos, 'quantFrascos')}
                        value={quantFrascos}
                        />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Valor da Primeira PA</Text>
                        <TextInput
                        style={styles.centeredInputField}
                        maxLength={10}
                        onChangeText={(text) => handleFieldChange(text, setPrimeiraPA, 'primeiraPA')}
                        value={primeiraPA}
                        />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Data Hemoglobina Glicada</Text>
                    <View style={styles.inputContainerWithIcon}>
                        <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
                        <TextInput
                        style={styles.inputFieldWithIcon}
                        keyboardType="numeric"
                        placeholder="__/__/____"
                        maxLength={10}
                        onChangeText={(text) => handleFieldChange(text, setHemoglobinaGlicada, 'hemoglobinaGlicada', true)}
                        value={hemoglobinaGlicada}
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
      centeredInputField: {
        borderWidth: 2,
        borderColor: '#0000AF',
        borderRadius: 25,
        paddingHorizontal: 10,
        height: 40,
        fontSize: 16,
        fontFamily: 'Montserrat-Regular',
        color: "#000",
        textAlign: 'center', // centraliza o texto dentro do campo
        width: 300,
        marginBottom: 10,
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
      },
      iconInsideInput: {
        width: 20,
        height: 20,
        marginRight: 5,
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

export default AcompanhamentoHiperdia;
