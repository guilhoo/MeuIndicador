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

const CriancaAcompanhamentoScreen = () => {

    const navigation = useNavigation();
    const route = useRoute();
    const { paciente } = route.params;

    const [penta1dose, setPenta1Dose] = useState('');
    const [penta2dose, setPenta2Dose] = useState('');
    const [penta3dose, setPenta3Dose] = useState('');

    const [penta1Apli, setPenta1Apli] = useState('');
    const [penta2Apli, setPenta2Apli] = useState('');
    const [penta3Apli, setPenta3Apli] = useState('');

    const [vip1dose, setVip1Dose] = useState('');
    const [vip2dose, setVip2Dose] = useState('');
    const [vip3dose, setVip3Dose] = useState('');

    const [vip1Apli, setVip1Apli] = useState('');
    const [vip2Apli, setVip2Apli] = useState('');
    const [vip3Apli, setVip3Apli] = useState('');

    // Estado para acumular todas as alterações pendentes
    const [pendingUpdates, setPendingUpdates] = useState({});

    const [contadorVacinas, setContadorVacinas] = useState(0);


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
              penta1dose: 5,
              penta2dose: 5,
              penta3dose: 5,
              vip1dose: 5,
              vip2dose: 5,
              vip3dose: 5,
              penta1Apli: 5,
              penta2Apli: 5,
              penta3Apli: 5,
              vip1Apli: 5,
              vip2Apli: 5,
              vip3Apli: 5,
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
      
            // 🔶 Lógica de conquista (Herói dos Pequeninos ou Guardião da Saúde)
            if (
              pendingUpdates.penta1dose ||
              pendingUpdates.penta2dose ||
              pendingUpdates.penta3dose ||
              pendingUpdates.vip1dose ||
              pendingUpdates.vip2dose ||
              pendingUpdates.vip3dose
            ) {
              const novoContador = incrementarContador(contadorVacinas); // Incrementa o contador localmente
              setContadorVacinas(novoContador); // Atualiza o estado localmente
      
              const resultadoConquista = await registrarConsulta(
                novoContador,
                setContadorVacinas,
                "Herói dos Pequeninos" // Atualize o nome conforme necessário
              );
      
              if (resultadoConquista?.desbloqueada) {
                console.log("Conquista desbloqueada:", "Herói dos Pequeninos");
                console.log("Pontos ganhos com a conquista:", resultadoConquista.pontos);
      
                const userId = auth().currentUser?.uid;
                await adicionarPontos(userId, resultadoConquista.pontos);
      
                Toast.show({
                  type: 'success',
                  text1: 'Parabéns!',
                  text2: `Você desbloqueou a conquista: "Herói dos Pequeninos"!`,
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
      
              // Preenche os estados dos campos de vacinas apenas se o dado existir
              setPenta1Dose(especificos.penta1dose || '');
              setPenta2Dose(especificos.penta2dose || '');
              setPenta3Dose(especificos.penta3dose || '');
              setPenta1Apli(especificos.penta1Apli || '');
              setPenta2Apli(especificos.penta2Apli || '');
              setPenta3Apli(especificos.penta3Apli || '');
      
              setVip1Dose(especificos.vip1dose || '');
              setVip2Dose(especificos.vip2dose || '');
              setVip3Dose(especificos.vip3dose || '');
              setVip1Apli(especificos.vip1Apli || '');
              setVip2Apli(especificos.vip2Apli || '');
              setVip3Apli(especificos.vip3Apli || '');
            }
          } catch (error) {
            console.error('Erro ao carregar dados do paciente:', error);
          }
        };
      
        loadPatientData();
    }, [paciente.id]);

    return(
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={confirmExit}>
                <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.title}>Acompanhamento</Text>
            </View>

            <View>
                <Text style={styles.patientName}>{paciente.nome}</Text>
                <Text style={styles.indicator}>Indicador: Crianças</Text>
            </View>

           
            <View style={styles.fieldsContainer}>
                <Text style={styles.columnLabel1}>Vacina PENTA</Text>
                <Text style={styles.columnLabel2}>Vacina VIP</Text>
            </View>    
          

            <View style={styles.fieldsContainer}>    
                {/* PENTA e VIP 1ª Dose */}
                <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Data 1ª Dose</Text>
                    <View style={styles.inputContainerWithIcon}>
                        <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
                        <TextInput
                            style={styles.inputFieldWithIcon}
                            keyboardType="numeric"
                            maxLength={10}
                            onChangeText={(text) => handleFieldChange(text, setPenta1Dose, 'penta1dose', true)}
                            value={penta1dose}
                        />
                    </View>
                </View>

                <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Data 1ª Dose</Text>
                    <View style={styles.inputContainerWithIcon}>
                        <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
                        <TextInput
                        style={styles.inputFieldWithIcon}
                        keyboardType="numeric"
                        maxLength={10}
                        onChangeText={(text) => handleFieldChange(text, setVip1Dose, 'vip1dose', true)}
                        value={vip1dose}
                        />
                    </View>
                </View>
            </View>    
            

            {/* PENTA e VIP 2ª Dose */}
            <View style={styles.fieldsContainer}> 
                <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Data 2ª Dose</Text>
                    <View style={styles.inputContainerWithIcon}>
                        <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
                        <TextInput
                        style={styles.inputFieldWithIcon}
                        keyboardType="numeric"
                        maxLength={10}
                        onChangeText={(text) => handleFieldChange(text, setPenta2Dose, 'penta2dose', true)}
                        value={penta2dose}
                        />
                    </View>
                </View>

                {/* VIP */}
                <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Data 2ª Dose</Text>
                    <View style={styles.inputContainerWithIcon}>
                        <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
                        <TextInput
                        style={styles.inputFieldWithIcon}
                        keyboardType="numeric"
                        maxLength={10}
                        onChangeText={(text) => handleFieldChange(text, setVip2Dose, 'vip2dose', true)}
                        value={vip2dose}
                        />
                    </View>
                </View>
            </View>

            {/* PENTA e VIP 3ª Dose */}
            <View style={styles.fieldsContainer}> 
                <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Data 3ª Dose</Text>
                    <View style={styles.inputContainerWithIcon}>
                        <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
                        <TextInput
                        style={styles.inputFieldWithIcon}
                        keyboardType="numeric"
                        maxLength={10}
                        onChangeText={(text) => handleFieldChange(text, setPenta3Dose, 'penta3dose', true)}
                        value={penta3dose}
                        />
                    </View>
                </View>

                {/* VIP */}
                <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Data 3ª Dose</Text>
                    <View style={styles.inputContainerWithIcon}>
                        <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
                        <TextInput
                        style={styles.inputFieldWithIcon}
                        keyboardType="numeric"
                        maxLength={10}
                        onChangeText={(text) => handleFieldChange(text, setVip3Dose, 'vip3dose', true)}
                        value={vip3dose}
                        />
                    </View>
                </View>
            </View>

            {/* PENTA e VIP 1ª APLICAÇÃO */}
            <View style={styles.fieldsContainer}> 
                <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Data 1ª Aplicação</Text>
                    <View style={styles.inputContainerWithIcon}>
                        <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
                        <TextInput
                        style={styles.inputFieldWithIcon}
                        keyboardType="numeric"
                        maxLength={10}
                        onChangeText={(text) => handleFieldChange(text, setPenta1Apli, 'penta1Apli', true)}
                        value={penta1Apli}
                        />
                    </View>
                </View>

                {/* VIP */}
                <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Data 1ª Aplicação</Text>
                    <View style={styles.inputContainerWithIcon}>
                        <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
                        <TextInput
                        style={styles.inputFieldWithIcon}
                        keyboardType="numeric"
                        maxLength={10}
                        onChangeText={(text) => handleFieldChange(text, setVip1Apli, 'vip1Apli', true)}
                        value={vip1Apli}
                        />
                    </View>
                </View>
            </View>

            {/* PENTA e VIP 2ª APLICAÇÃO */}
            <View style={styles.fieldsContainer}> 
                <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Data 2ª Aplicação</Text>
                    <View style={styles.inputContainerWithIcon}>
                        <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
                        <TextInput
                        style={styles.inputFieldWithIcon}
                        keyboardType="numeric"
                        maxLength={10}
                        onChangeText={(text) => handleFieldChange(text, setPenta2Apli, 'penta2Apli', true)}
                        value={penta2Apli}
                        />
                    </View>
                </View>

                {/* VIP */}
                <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Data 2ª Aplicação</Text>
                    <View style={styles.inputContainerWithIcon}>
                        <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
                        <TextInput
                        style={styles.inputFieldWithIcon}
                        keyboardType="numeric"
                        maxLength={10}
                        onChangeText={(text) => handleFieldChange(text, setVip2Apli, 'vip2Apli', true)}
                        value={vip2Apli}
                        />
                    </View>
                </View>
            </View>

            {/* PENTA e VIP 3ª APLICAÇÃO */}
            <View style={styles.fieldsContainer}> 
                <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Data 3ª Aplicação</Text>
                    <View style={styles.inputContainerWithIcon}>
                        <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
                        <TextInput
                        style={styles.inputFieldWithIcon}
                        keyboardType="numeric"
                        maxLength={10}
                        onChangeText={(text) => handleFieldChange(text, setPenta3Apli, 'penta3Apli', true)}
                        value={penta3Apli}
                        />
                    </View>
                </View>

                {/* VIP */}
                <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Data 3ª Aplicação</Text>
                    <View style={styles.inputContainerWithIcon}>
                        <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
                        <TextInput
                        style={styles.inputFieldWithIcon}
                        keyboardType="numeric"
                        maxLength={10}
                        onChangeText={(text) => handleFieldChange(text, setVip3Apli, 'vip3Apli', true)}
                        value={vip3Apli}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    columnLabel1:{
        color: '#0000AF',
        fontFamily: 'Montserrat-Bold',
        fontSize: 18,
        marginRight: 40,
        marginLeft: -15,
    },
    columnLabel2:{
        color: '#0000AF',
        fontFamily: 'Montserrat-Bold',
        fontSize: 20,
    },
    centerColumn:{
        flexDirection: 'row',
    },
    fieldGroup: {
        flex: 1,
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
    },
    inputContainer: {
        borderWidth: 2,
        borderColor: '#0000AF',
        borderRadius: 25,
        paddingHorizontal: 10,
        height: 40,
        justifyContent: 'center',
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
    },
});

export default CriancaAcompanhamentoScreen;
