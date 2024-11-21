import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView, BackHandler } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const formatarIndicador = (indicador) => {
  switch (indicador) {
    case 'hiperdia':
      return 'Hiperdia';
    case 'crianca':
      return 'Criança';
    case 'gravida':
      return 'Grávida';
    case 'mulher':
      return 'Mulher';
    default:
      return indicador;
  }
};

const DadosCadastraisScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { paciente } = route.params;

  const [cpf, setCpf] = useState('');
  const [cnes, setCnes] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [currentField, setCurrentField] = useState(null);
  const [pendingUpdates, setPendingUpdates] = useState({});

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        const patientDoc = await firestore().collection('pacientes').doc(paciente.id).get();
        const patientData = patientDoc.data();

        if (patientData) {
          setCpf(patientData.cpf || '');
          setCnes(patientData.cnes || '');
          setDataNascimento(patientData.nascimento || '');
          setTelefone(patientData.telefone || '');
          setEndereco(patientData.endereco || '');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do paciente:', error);
      }
    };

    loadPatientData();
  }, [paciente.id]);

  const handleFieldChange = (newValue, setValue) => {
    setValue(newValue);
    setHasUnsavedChanges(true);
  };

  const formatarData = (text) => {
    const textOnlyNumbers = text.replace(/\D/g, '');
    if (textOnlyNumbers.length <= 2) {
      return textOnlyNumbers;
    } else if (textOnlyNumbers.length <= 4) {
      return `${textOnlyNumbers.slice(0, 2)}/${textOnlyNumbers.slice(2)}`;
    } else {
      return `${textOnlyNumbers.slice(0, 2)}/${textOnlyNumbers.slice(2, 4)}/${textOnlyNumbers.slice(4, 8)}`;
    }
  };

  const formatarCPF = (text) => {
    const cpfLimpo = text.replace(/\D/g, ''); // Remove tudo que não for número
    const cpfFormatado = cpfLimpo
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca o primeiro ponto
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca o segundo ponto
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Coloca o traço
    
    return cpfFormatado;
  };

  // Função para formatar Telefone
  const formatarTelefone = (text) => {
    const telefoneLimpo = text.replace(/\D/g, '');
    if (telefoneLimpo.length <= 2) {
      return `(${telefoneLimpo}`;
    } else if (telefoneLimpo.length <= 7) {
      return `(${telefoneLimpo.slice(0, 2)}) ${telefoneLimpo.slice(2)}`;
    } else {
      return `(${telefoneLimpo.slice(0, 2)}) ${telefoneLimpo.slice(2, 7)}-${telefoneLimpo.slice(7, 11)}`;
    }
  };

  // Função para salvar todas as mudanças de uma vez
  const saveChanges = async () => {
    try {
      const updatedData = {
        cpf,
        cnes,
        nascimento: dataNascimento,
        telefone,
        endereco,
      };
  
      console.log("Salvando dados atualizados:", updatedData);
      
      await firestore().collection('pacientes').doc(paciente.id).update(updatedData);
  
      setHasUnsavedChanges(false);
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Alterações salvas com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Falha ao salvar alterações.',
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      const backHandler = () => {
        confirmExit();
        return true;
      };
  
      const subscription = BackHandler.addEventListener('hardwareBackPress', backHandler);
  
      return () => subscription.remove();
    }, [hasUnsavedChanges, currentField])
  );

  useEffect(() => {
    const backAction = () => {
      confirmExit();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [hasUnsavedChanges, pendingUpdates]);

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

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={confirmExit}>
        <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
      </TouchableOpacity>
      <Text style={styles.title}>Dados Cadastrais</Text>
    </View>

    <View>
      <Text style={styles.patientName}>{paciente.nome}</Text>
      <Text style={styles.indicator}>Indicador: {formatarIndicador(paciente.indicador)}</Text>
    </View>

    {/* Campo CPF */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>CPF</Text>
      <TextInput
        style={styles.inputField}
        maxLength={14}
        value={cpf}
        onChangeText={(text) => {
          setCpf(formatarCPF(text));
          setHasUnsavedChanges(true);
        }}
      />
    </View>

    {/* Campo CNES */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>CNES</Text>
      <TextInput
        style={styles.inputField}
        value={cnes}
        maxLength={8}
        onChangeText={(text) => {
          setCnes((text));
          setHasUnsavedChanges(true);
        }}
      />
    </View>

    {/* Campo Data de Nascimento */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>Data de Nascimento</Text>
      <TextInput
        style={styles.inputField}
        keyboardType="numeric"
        maxLength={10}
        value={dataNascimento}
        onChangeText={(text) => {
          setDataNascimento(formatarData(text));
          setHasUnsavedChanges(true);
        }}
      />
    </View>

    {/* Campo Telefone */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>Telefone</Text>
      <TextInput
        style={styles.inputField}
        keyboardType="phone-pad"
        maxLength={15}
        value={telefone}
        onChangeText={(text) => {
          setTelefone(formatarTelefone(text));
          setHasUnsavedChanges(true);
        }}
      />
    </View>

    {/* Campo Endereço */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>Endereço</Text>
      <TextInput
        style={styles.inputField}
        value={endereco}
        onChangeText={(text) => {
          setEndereco((text));
          setHasUnsavedChanges(true);
        }}
      />
    </View>

    {/* Botão Salvar */}
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.button} onPress={saveChanges}>
        <Text style={styles.buttonText}>Salvar Alterações</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
  );
};


const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
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
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: '#000',
    marginLeft: 10,
  },
  patientName: {
    fontSize: 22,
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
  fieldGroup: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 5,
    color: '#000',
    marginLeft: 10,
  },
  inputField: {
    borderWidth: 2,
    borderColor: '#0000AF',
    borderRadius: 25,
    paddingHorizontal: 10,
    height: 40,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: "#000"
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#0000AF',
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default DadosCadastraisScreen;
