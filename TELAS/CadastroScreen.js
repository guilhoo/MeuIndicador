import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, ImageBackground, ScrollView  } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import auth from '@react-native-firebase/auth';  // 🔶 Importa o módulo de autenticação
import firestore from '@react-native-firebase/firestore'; // Importa Firestore


const CadastroScreen = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [genero, setGenero] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [coren, setCoren] = useState('');
  const [selectedRole, setSelectedRole] = useState('Enfermeiro');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Função de validação dos campos
  const validateForm = () => {
    // Verifica se todos os campos obrigatórios estão preenchidos
    if (!nome || !genero || !email || !senha || !confirmarSenha || (selectedRole === 'Enfermeiro' && !coren)) {
      Toast.show({
        type: 'error',
        text1: 'Campos em branco',
        text2: 'Revise o formulário e tente novamente.',
      });
      return false;
    }

    // Validação do Coren se o usuário for Enfermeiro
    if (selectedRole === 'Enfermeiro' && coren.length !== 8) {
      Toast.show({
        type: 'error',
        text1: 'Coren inválido',
        text2: 'O número do Coren deve ter 8 dígitos.',
      });
      return false;
    }

    if (!genero) {
      Toast.show({
        type: 'error',
        text1: 'Gênero não selecionado',
        text2: 'Por favor, selecione um gênero.',
      });
      return false;
    }

    // Validação de email com @gmail.com ou @hotmail.com
    const emailRegex = /^[\w-\.]+@(gmail|hotmail)\.com$/;  // 🔶 Expressão regular para validar o email

    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'E-mail inválido',
        text2: 'Digite um e-mail válido com @gmail.com ou @hotmail.com.',
      });
      return false;
    }

    // Validação da força da senha
    const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    
    if (!senhaRegex.test(senha)) {
      Toast.show({
        type: 'error',
        text1: 'Senha fraca',
        text2: 'Use letras maiúsculas, minúsculas, números e caracteres especiais.',
      });
      return false;
    }

    // Verifica se as senhas são iguais
    if (senha !== confirmarSenha) {
      Toast.show({
        type: 'error',
        text1: 'Senhas não coincidem',
        text2: 'As senhas digitadas não são iguais.',
      });
      return false;
    }

    return true;
  };

  // Função para lidar com o registro e implementar as validações do firebase
  const handleRegister = async () => {
    if (validateForm()) {
      try {
        // Cria um novo usuário no Firebase Authentication
        const userCredential = await auth().createUserWithEmailAndPassword(email, senha);
        const userId = userCredential.user.uid; // Pega o ID do usuário
  
        console.log("Usuário cadastrado com sucesso");

        Toast.show({
          type: 'success',
          text1: 'Sucesso!',
          text2: 'Usuário cadastrado com sucesso.',
        });

        // 🔶 Salva os dados do usuário no Firestore após o registro
        await firestore().collection('users').doc(userId).set({
          nome: nome,
          genero: genero,
          email: email,
          role: selectedRole, // "Enfermeiro" ou "Agente de Saúde"
          dataNascimento: firestore.Timestamp.fromDate(date), // Armazena como Timestamp
          coren: coren || null, // Se o campo "Coren" não for aplicável, coloca null
          gamification: {
            pontos: 0,        // Inicia com 0 pontos
            nivel: 1,         // Nível inicial
            medalhas: []      // Lista de medalhas vazia
          }
        });

        // Adiciona um pequeno delay antes de navegar
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2000);  // Aguarda 1 segundo antes de redirecionar
  
        // 🔶 Salva o tipo de usuário (Enfermeiro ou Agente de Saúde) no Firestore
        await firestore().collection('users').doc(userId).set({
          nome: nome,
          genero: genero,
          email: email,
          role: selectedRole, // "Enfermeiro" ou "Agente de Saúde"
          dataNascimento: date,
          gamification: {
            pontos: 0,        // Inicia com 0 pontos
            nivel: 1,         // Nível inicial
            medalhas: []      // Lista de medalhas vazia
          }
        });
  
      } catch (error) {
        // 🔶 Captura erros e mostra uma mensagem apropriada
        if (error.code === 'auth/email-already-in-use') {
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Esse email já está em uso.',
          });
        } else if (error.code === 'auth/invalid-email') {
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Email inválido.',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Falha ao criar o usuário. Tente novamente.',
          });
        }
      }
    }
  };;

  // Função para abrir o seletor de data
  const showDatePickerHandler = () => {
    setShowDatePicker(true);
  };

  // Função para lidar com a seleção de data
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false); // 🔶 Fecha o seletor de data após selecionar (para ambas as plataformas)
    setDate(currentDate); // Atualiza o estado da data
  };

  return (
    <ImageBackground
      source={require('../assets/BackLogin.png')}  // Usando a mesma imagem de fundo do login
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Header com Ícone de Voltar e Título */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.title}>Cadastro</Text>
          </View>

          {/* Imagem da moça de blusa azul */}
          <Image 
            source={require('../assets/register-icon.png')} 
            style={styles.registerIcon}
            resizeMode="contain"
          />

          {/* Botões de Seleção: Enfermeiro ou Agente de Saúde */}
          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                selectedRole === 'Enfermeiro' && styles.selectedButton, // Estilo quando selecionado
              ]}
              onPress={() => setSelectedRole('Enfermeiro')}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  selectedRole === 'Enfermeiro' && styles.selectedButtonText, // Texto branco quando selecionado
                ]}
              >
                Enfermeiro
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                selectedRole === 'Agente de Saúde' && styles.selectedButton, // Estilo quando selecionado
              ]}
              onPress={() => setSelectedRole('Agente de Saúde')}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  selectedRole === 'Agente de Saúde' && styles.selectedButtonText, // Texto branco quando selecionado
                ]}
              >
                Agente de saúde
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Campos de Texto com Rótulos Externos */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              maxLength={70}
              value={nome}  // 🔶 Vincula o valor do campo com o estado
              onChangeText={setNome}  // 🔶 Atualiza o estado conforme o usuário digita
            />
          </View>

          {/* Seleção de Gênero */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Gênero</Text>
            <View style={styles.genderSelector}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  genero === 'Masculino' && styles.selectedButton, // Aplica o estilo de seleção
                ]}
                onPress={() => {
                  setGenero('Masculino')
                  console.log('Gênero selecionado:', 'Masculino');
                }}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    genero === 'Masculino' && styles.selectedButtonText, // Altera o texto quando selecionado
                  ]}
                >
                  Masculino
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  genero === 'Feminino' && styles.selectedButton,
                ]}
                onPress={() => {
                  setGenero('Feminino');
                  console.log('Gênero selecionado:', 'Feminino');
                }}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    genero === 'Feminino' && styles.selectedButtonText,
                  ]}
                >
                  Feminino
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {selectedRole === 'Enfermeiro' && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Coren</Text>
              <TextInput
                style={styles.input}
                value={coren}  // 🔶 Vincula o valor do campo com o estado
                onChangeText={setCoren}  // 🔶 Atualiza o estado conforme o usuário digita
              />
            </View>
          )}

          {/* Seletor de Data de Nascimento */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Data de Nascimento</Text>
            <TouchableOpacity onPress={showDatePickerHandler} style={styles.datePickerButton}>
              <Text style={styles.datePickerText}>
                {date.toLocaleDateString()} {/* Mostra a data selecionada */}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}  // 🔶 Vincula o valor do campo com o estado
              onChangeText={setEmail}  // 🔶 Atualiza o estado conforme o usuário digita
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={senha}  // 🔶 Vincula o valor do campo com o estado
              onChangeText={setSenha}  // 🔶 Atualiza o estado conforme o usuário digita
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Confirmar Senha</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={confirmarSenha}  // 🔶 Vincula o valor do campo com o estado
              onChangeText={setConfirmarSenha}  // 🔶 Atualiza o estado conforme o usuário digita
            />
          </View>

          {/* Botão de Cadastrar */}
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Cadastrar</Text>
          </TouchableOpacity>

          {/* O restante dos campos da tela de cadastro será adicionado aqui */}
        </View>
      </ScrollView>
      <Toast /> 
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20, // Espaço no final do scroll
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: 'transparent', // Tornar o fundo transparente para ver a imagem de fundo
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
  },
  backButton: {
    marginRight: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    color: '#000000',
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    textAlign: 'center',
    flex: 0.9, 
  },
  registerIcon: {
    width: 220,   // Ajuste o tamanho conforme necessário
    height: 220,  // Ajuste o tamanho conforme necessário
    alignSelf: 'center',
    marginVertical: 25,  // Espaçamento entre a imagem e outros elementos
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  roleButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 10,
    backgroundColor: '#FFFFFF',  // Fundo branco quando não selecionado
  },
  selectedButton: {
    backgroundColor: '#2222E7', // Fundo azul quando selecionado
    borderColor: '#2222E7',     // Borda azul quando selecionado
  },
  roleButtonText: {
    color: '#000000',  // Texto preto quando não selecionado
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  selectedButtonText: {
    color: '#FFFFFF',  // Texto branco quando selecionado
    fontFamily: 'Montserrat-Bold',
  },
  fieldContainer: {
    marginBottom: 3,
  },
  label: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 5,
    fontFamily: 'Montserrat-Regular', // Fonte personalizada
  },
  input: {
    height: 40,
    borderColor: '#2222E7',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontFamily: 'Montserrat-Regular',
    color: '#000000',
  },
  registerButton: {
    backgroundColor: '#2222E7',
    borderRadius: 20,
    paddingVertical: 10,
    width: '50%', 
    alignSelf: 'center',  
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
  },
  datePickerButton: { // 🔶 Estilo do botão de data
    height: 40,
    borderColor: '#2222E7',
    borderWidth: 1,
    borderRadius: 20,
    justifyContent: 'center',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  datePickerText: { // 🔶 Estilo do texto no seletor de data
    fontSize: 16,
    color: '#000',
    fontFamily: 'Montserrat-Regular',
  },
  genderSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  genderButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
    borderColor: '#2222E7',
  },
  genderButtonText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat-Regular',
  },
  selectedButtonText: {
    color: '#fff', // Texto branco quando selecionado
  },
  
});

export default CadastroScreen;
