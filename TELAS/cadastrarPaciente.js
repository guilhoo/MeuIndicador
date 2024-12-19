import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation  } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';

const CadastroPacienteScreen = () => {

  const navigation = useNavigation();
  const [indicador, setIndicador] = useState('gravida'); // Estado inicial de grávidas
  const [open, setOpen] = useState(false); // Estado de abrir o dropdown

  const [microareas, setMicroareas] = useState([]); // Microáreas do Firebase
  const [selectedMicroarea, setSelectedMicroarea] = useState(null); // Microárea selecionada
  const [openMicroarea, setOpenMicroarea] = useState(false); // Estado de abrir o dropdown para microárea

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnes, setCnes] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');

  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');

    // Função para retornar o ícone com base no indicador selecionado
  const getIconByIndicador = () => {
    switch (indicador) {
    case 'gravida':
        return require('../assets/pregnant.png');
    case 'crianca':
        return require('../assets/kids.png');
    case 'hiperdia':
        return require('../assets/hiperdia.png');
    case 'mulher':
        return require('../assets/women.png');
    default:
        return require('../assets/pregnant.png'); // Padrão para grávidas
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

  // Função para buscar microáreas do Firebase
  const fetchMicroareas = async () => {
    try {
      const snapshot = await firestore().collection('microareas').get();
      const microareasList = snapshot.docs.map((doc) => ({
        label: doc.data().Nome, // Nome da microárea
        value: doc.id,          // ID da microárea
      }));
      setMicroareas(microareasList);
    } catch (error) {
      console.error('Erro ao buscar microáreas: ', error);
    }
  };

  useEffect(() => {
    fetchMicroareas(); // Chama a função quando o componente monta
  }, []);

  const cadastrarPaciente = async () => {

      console.log("Dados a serem enviados:", {
        nome,
        cpf,
        cnes,
        nascimento: dataNascimento,
        microarea: selectedMicroarea,
        indicador,
        endereco,
        telefone,
      });

    if (!nome || !cpf || !cnes || !dataNascimento || !selectedMicroarea) {
        Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Preencha todos os campos!',
          });
      return;
    }

    if (cpf.length !== 14) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'O CPF deve ter 11 dígitos!',
        });
        return;
    }
    
    if (cnes.length !== 7) {
    Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'O CNES deve ter 7 dígitos!',
        });
        return;
    }

    try {
        await firestore().collection('pacientes').add({
        nome: nome,
        cpf: cpf,
        cnes: cnes,
        nascimento: dataNascimento,
        microarea: selectedMicroarea,
        indicador: indicador,
        status: 'ATIVO', // Adiciona o status como ATIVO
        especificos: {},
        endereco: endereco, // Adiciona o campo endereco com valor vazio
        telefone: telefone, // Este campo pode ser preenchido com dados adicionais depois
        });

        Toast.show({
            type: 'success',
            text1: 'Sucesso',
            text2: 'Paciente cadastrado com sucesso!',
        });

        setTimeout(() => {
            navigation.goBack(); // Volta para a tela anterior após o cadastro
        }, 1000);


    } catch (error) {
        console.error('Erro ao cadastrar paciente: ', error);
        Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Erro ao cadastrar paciente. Tente novamente.',
          });
    }
};

  return (
    <ScrollView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.title}>Cadastrar Pacientes</Text>
        </View>

        {/* Exibe o ícone do indicador */}
        <Image source={getIconByIndicador()} style={styles.icon} />
        
        {/* Dropdown de Indicadores */}
        <View style={[styles.dropdownContainer, { zIndex: 2 }]}>
            <Text style={styles.dropDownLabel}>Indicador</Text>
            <DropDownPicker
            open={open}
            value={indicador}
            items={[
                { label: 'Grávidas', value: 'gravida' },
                { label: 'Crianças', value: 'crianca' },
                { label: 'Hiperdia', value: 'hiperdia' },
                { label: 'Mulheres', value: 'mulher' }
            ]}
            setOpen={setOpen}
            setValue={setIndicador}
            placeholder="Selecionar Indicador"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropDownContainer}
            textStyle={styles.dropdownText} 
            />
        </View>

        {/* Dropdown de Microáreas */}
        <View style={[styles.dropdownContainer, { zIndex: 1 }]}>
            <Text style={styles.dropDownLabel}>Microárea</Text>
            <DropDownPicker
                open={openMicroarea}
                value={selectedMicroarea}
                items={microareas}
                setOpen={setOpenMicroarea}
                setValue={setSelectedMicroarea}
                placeholder="Selecionar Microárea"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropDownContainer}
                textStyle={styles.dropdownText} 
            />
        </View>

        {/* Campo Nome */}
        <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            />
        </View>

        {/* Campo CPF */}
        <View style={styles.inputContainer}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
            style={styles.input}
            value={cpf}
            onChangeText={(text) => setCpf(formatarCPF(text))} // Formata o CPF enquanto digita
            keyboardType="numeric"
            maxLength={14} // Máximo de 14 caracteres (incluindo os pontos e o traço)
            />
        </View>

        {/* Campo CNES */}
        <View style={styles.inputContainer}>
            <Text style={styles.label}>CNES</Text>
            <TextInput
            style={styles.input}
            value={cnes}
            onChangeText={(text) => setCnes(text.replace(/[^0-9]/g, ''))} // Permite apenas números
            keyboardType="numeric"
            maxLength={7} // Limita a 7 dígitos
            />
        </View>

        {/* Campo Data de Nascimento */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Data de Nascimento</Text>
          <TextInput
            style={styles.input}
            value={dataNascimento}
            onChangeText={(text) => setDataNascimento(formatarData(text))}
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={cadastrarPaciente}>
                <Text style={styles.buttonText}>Cadastrar{"\n"}Paciente</Text>
            </TouchableOpacity>
        </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  icon: {
    width: 150,
    height: 150,
    marginBottom: 20,
    alignSelf: "center",
    marginTop: 20,
  },
  dropDownLabel: {
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    marginBottom: 5,
    marginLeft: 5,
  },
  dropdown: {
    borderColor: '#0000AF',
    borderWidth: 2,
    borderRadius: 25,
    marginBottom: 8,
  },
  dropDownContainer: {
    borderColor: '#2222E7',
  },
  dropdownText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    paddingVertical: 8,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#000',
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    borderWidth: 2,
    borderColor: '#0000AF',
    borderRadius: 25,
    padding: 10,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#000',
    backgroundColor: "#fff",
  },
  datePicker: {
    borderWidth: 2,
    borderColor: '#0000AF',
    borderRadius: 25,
    padding: 10,
    justifyContent: 'center',
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#000',
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
    marginBottom: 40,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default CadastroPacienteScreen;
