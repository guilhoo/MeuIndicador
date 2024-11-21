import React, { useState, useEffect  } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Alert, BackHandler  } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

const GravidaAcompanhamentoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { paciente } = route.params;

  const [dum, setDum] = useState('');
  const [idadeGInicio, setIdadeGInicio] = useState('');
  const [testeRapido, setTesteRapido] = useState('');
  const [consultaOdonto, setConsultaOdonto] = useState('');
  const [preventivo, setPreventivo] = useState('');
  const [causaAltoRisco, setCausaAltoRisco] = useState('');
  const [dataPrimeiraConsulta, setDataPrimeiraConsulta] = useState('');
  const [dataSegundaConsulta, setDataSegundaConsulta] = useState('');
  const [dataTerceiraConsulta, setDataTerceiraConsulta] = useState('');
  const [dataQuartaConsulta, setDataQuartaConsulta] = useState('');
  const [dataQuintaConsulta, setDataQuintaConsulta] = useState('');
  const [dataParto, setDataParto] = useState('');
  const [tipoParto, setTipoParto] = useState('');

  // Estado para acumular todas as alterações pendentes
  const [pendingUpdates, setPendingUpdates] = useState({});

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

  // Função para salvar a alteração do campo específico no banco de dados
  const saveChanges = async () => {
    if (Object.keys(pendingUpdates).length > 0) {
      try {
        // Cria um objeto para atualização no Firestore com a estrutura correta
        const updateData = Object.keys(pendingUpdates).reduce((acc, field) => {
          acc[`especificos.${field}`] = pendingUpdates[field];
          return acc;
        }, {});

        await firestore().collection('pacientes').doc(paciente.id).update(updateData);
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

  // Função para carregar dados do Firestore ao montar a tela
  useEffect(() => {
    const loadPatientData = async () => {
      try {
        const patientDoc = await firestore().collection('pacientes').doc(paciente.id).get();
        const patientData = patientDoc.data();

        if (patientData && patientData.especificos) {
          const especificos = patientData.especificos;

          // Preenche os estados dos campos apenas se o dado existir
          setDum(especificos.dum || '');
          setIdadeGInicio(especificos.idadeGInicio || '');
          setTesteRapido(especificos.testeRapido || '');
          setConsultaOdonto(especificos.consultaOdonto || '');
          setPreventivo(especificos.preventivo || '');
          setCausaAltoRisco(especificos.causaAltoRisco || '');
          setDataPrimeiraConsulta(especificos.dataPrimeiraConsulta || '');
          setDataSegundaConsulta(especificos.dataSegundaConsulta || '');
          setDataTerceiraConsulta(especificos.dataTerceiraConsulta || '');
          setDataQuartaConsulta(especificos.dataQuartaConsulta || '');
          setDataQuintaConsulta(especificos.dataQuintaConsulta || '');
          setDataParto(especificos.dataParto || '');
          setTipoParto(especificos.tipoParto || '');
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
        <Text style={styles.indicator}>Indicador: Grávida</Text>
      </View>

      {/* Container para os campos */}
      <View style={styles.fieldsContainer}>
        {/* DUM */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>DUM</Text>
          <View style={styles.inputContainerWithIcon}>
            <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
            <TextInput
              style={styles.inputFieldWithIcon}
              keyboardType="numeric"
              maxLength={10}
              onChangeText={(text) => handleFieldChange(text, setDum, 'dum', true)}
              value={dum}
            />
          </View>
        </View>

        {/* Idade G. Início */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Idade G. Início</Text>
          <View style={styles.inputContainerWithIcon}>
            <TextInput
              style={styles.inputFieldWithSuffix}
              placeholder="00"
              keyboardType="numeric"
              maxLength={2}
              onChangeText={(text) => handleFieldChange(text, setIdadeGInicio, 'idadeGInicio')}
              value={idadeGInicio}
            />
            <Text style={styles.suffixText}>semanas</Text>
          </View>
        </View>
      </View>

      {/* Teste Rápido e Consulta Odonto */}
      <View style={styles.fieldsContainer}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Teste Rápido</Text>
          <View style={styles.inputContainerWithIcon}>
            <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
            <TextInput
              style={styles.inputFieldWithIcon}
              keyboardType="numeric"
              maxLength={10}
              onChangeText={(text) => handleFieldChange(text, setTesteRapido, 'testeRapido', true)}
              value={testeRapido}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Consulta Odonto</Text>
          <View style={styles.inputContainerWithIcon}>
            <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
            <TextInput
              style={styles.inputFieldWithIcon}
              keyboardType="numeric"
              maxLength={10}
              onChangeText={(text) => handleFieldChange(text, setConsultaOdonto, 'consultaOdonto', true)}
              value={consultaOdonto}
            />
          </View>
        </View>
      </View>

      {/* Preventivo e Causa de Alto Risco */}
      <View style={styles.fieldsContainer}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Preventivo</Text>
          <View style={styles.inputContainerWithIcon}>
            <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
            <TextInput
              style={styles.inputFieldWithIcon}
              keyboardType="numeric"
              maxLength={10}
              onChangeText={(text) => handleFieldChange(text, setPreventivo, 'preventivo', true)}
              value={preventivo}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Alto Risco?</Text>
          <TextInput
            style={styles.inputField}
            maxLength={3}
            onChangeText={(text) => {
              // Verifica se o texto é uma parte válida de "Sim" ou "Não"
              const lowerText = text.toLowerCase();
              if (
                lowerText === '' || 
                lowerText === 's' || 
                lowerText === 'S' ||
                lowerText === 'si' || 
                lowerText === 'Si' || 
                lowerText === 'SI' ||
                lowerText === 'sim' || 
                lowerText === 'Sim' || 
                lowerText === 'SIM' ||
                lowerText === 'n' || 
                lowerText === 'N' ||
                lowerText === 'na' || 
                lowerText === 'Na' || 
                lowerText === 'NA' ||
                lowerText === 'nao' || 
                lowerText === 'Nao' || 
                lowerText === 'NAO' ||
                lowerText === 'não' || 
                lowerText === 'Não' || 
                lowerText === 'NÃO' ||
                lowerText === 'nã' || 
                lowerText === 'Nã' || 
                lowerText === 'NÃ'
              ) {
                handleFieldChange(text, setCausaAltoRisco, 'causaAltoRisco');
              }
            }}
            value={causaAltoRisco}
          />
        </View>
      </View>

      <View style={styles.fieldsContainer}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Data 1ª Consulta</Text>
          <View style={styles.inputContainerWithIcon}>
            <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
            <TextInput
              style={styles.inputFieldWithIcon}
              keyboardType="numeric"
              placeholder="__/__/____"
              maxLength={10}
              onChangeText={(text) => handleFieldChange(text, setDataPrimeiraConsulta, 'dataPrimeiraConsulta', true)}
              value={dataPrimeiraConsulta}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Data 2ª Consulta</Text>
          <View style={styles.inputContainerWithIcon}>
            <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
            <TextInput
              style={styles.inputFieldWithIcon}
              keyboardType="numeric"
              placeholder="__/__/____"
              maxLength={10}
              onChangeText={(text) => handleFieldChange(text, setDataSegundaConsulta, 'dataSegundaConsulta', true)}
              value={dataSegundaConsulta}
            />
          </View>
        </View>
      </View>

      <View style={styles.fieldsContainer}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Data 3ª Consulta</Text>
          <View style={styles.inputContainerWithIcon}>
            <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
            <TextInput
              style={styles.inputFieldWithIcon}
              keyboardType="numeric"
              placeholder="__/__/____"
              maxLength={10}
              onChangeText={(text) => handleFieldChange(text, setDataTerceiraConsulta, 'dataTerceiraConsulta', true)}
              value={dataTerceiraConsulta}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Data 4ª Consulta</Text>
          <View style={styles.inputContainerWithIcon}>
            <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
            <TextInput
              style={styles.inputFieldWithIcon}
              keyboardType="numeric"
              placeholder="__/__/____"
              maxLength={10}
              onChangeText={(text) => handleFieldChange(text, setDataQuartaConsulta, 'dataQuartaConsulta', true)}
              value={dataQuartaConsulta}
            />
          </View>
        </View>
      </View>

      <View style={styles.fieldsContainer}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Data 5ª Consulta</Text>
          <View style={styles.inputContainerWithIcon}>
            <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
            <TextInput
              style={styles.inputFieldWithIcon}
              keyboardType="numeric"
              placeholder="__/__/____"
              maxLength={10}
              onChangeText={(text) => handleFieldChange(text, setDataQuintaConsulta, 'dataQuintaConsulta', true)}
              value={dataQuintaConsulta}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Data do Parto</Text>
          <View style={styles.inputContainerWithIcon}>
            <Image source={require('../assets/calendar-icon.png')} style={styles.iconInsideInput} />
            <TextInput
              style={styles.inputFieldWithIcon}
              keyboardType="numeric"
              placeholder="__/__/____"
              maxLength={10}
              onChangeText={(text) => handleFieldChange(text, setDataParto, 'dataParto', true)}
              value={dataParto}
            />
          </View>
        </View>
      </View>

      <View style={styles.centeredFieldGroup}>
        <Text style={styles.fieldLabel}>Tipo de Parto</Text>
        <TextInput
          style={styles.centeredInputField}
          maxLength={10}
          onChangeText={(text) => handleFieldChange(text, setTipoParto, 'tipoParto')}
          value={tipoParto}
        />
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
  inputFieldWithSuffix: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    color: "#000",
    borderWidth: 0,
    paddingHorizontal: 15,
    paddingVertical: 1,
  },
  suffixText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#000',
  },
  inputField: {
    borderWidth: 2,
    borderColor: '#0000AF',
    borderRadius: 25,
    paddingHorizontal: 10,
    height: 40,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#000',
    textAlign:"center",
  },
  centeredFieldGroup: {
    alignItems: 'center',
    marginBottom: 20,
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
    width: 150,
  },
});

export default GravidaAcompanhamentoScreen;
