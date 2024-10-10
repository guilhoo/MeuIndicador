import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, ImageBackground, ScrollView, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import auth from '@react-native-firebase/auth';  // Importa Firebase Authentication

const PasswordReset = ({ navigation }) => {

    const [email, setEmail] = useState('');
    const [modalVisible, setModalVisible] = useState(false); // Estado para controlar a visibilidade do modal
    const [modalMessage, setModalMessage] = useState(''); // Estado para armazenar a mensagem do modal

    // Função para enviar o e-mail de redefinição de senha usando a tela do Firebase
    const sendPasswordResetEmail = async (email) => {
        try {
            // Define o idioma para português
            auth().languageCode = 'pt';  // Define o idioma como português
            
            // Envia o e-mail de redefinição de senha
            await auth().sendPasswordResetEmail(email); 

            // Mostra o modal de sucesso
            setModalMessage(
                'Um link para a mudança da sua senha foi enviado ao e-mail informado. Clique no link para prosseguir com a redefinição. Caso não tenha recebido, verifique se digitou o e-mail correto.'
            );
            setModalVisible(true);  // Abre o modal

        } catch (error) {
            // Mostra o modal com a mensagem apropriada caso ocorra um erro
            if (error.code === 'auth/user-not-found') {
                Toast.show({
                  type: 'error',
                  text1: 'Erro',
                  text2: 'Esse e-mail não está registrado no sistema.',
                });
            } else if (error.code === 'auth/invalid-email') {
                Toast.show({
                  type: 'error',
                  text1: 'Erro',
                  text2: 'Digite um e-mail com @gmail.com ou @hotmail.com.',
                });
            } else {
                Toast.show({
                  type: 'error',
                  text1: 'Erro',
                  text2: 'Não foi possível enviar o e-mail. Tente novamente.',
                });
            }
        }
    };

   // Função para validar o e-mail e enviar o e-mail de redefinição
    const handleAdvance = () => {
        const emailRegex = /^[\w-\.]+@(gmail|hotmail)\.com$/;

        // Verifica se o campo de e-mail está vazio
        if (!email) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Informe seu endereço de e-mail.',
            });
            return;
        }

        // Verifica se o e-mail está no formato correto (@gmail.com ou @hotmail.com)
        if (!emailRegex.test(email)) {
            Toast.show({
                type: 'error',
                text1: 'E-mail inválido',
                text2: 'Digite um e-mail válido com @gmail.com ou @hotmail.com.',
            });
            return;
        }
        // Chama a função para enviar o e-mail de redefinição
        sendPasswordResetEmail(email);
    };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adapta o comportamento para iOS e Android
    >
      <ImageBackground
        source={require('../assets/BackLogin.png')}  // Usando a mesma imagem de fundo do login
        style={styles.backgroundImage}
        resizeMode="cover"
        >
        
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
                {/* Header com ícone de voltar e título */}
                <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Redefinir Senha</Text>
                </View>
                
                {/* Ícone centralizado */}
                <View style={styles.iconContainer}>
                <Image source={require('../assets/unlock.png')} style={styles.unlockIcon} />
                </View>

                <Text style={styles.text}>Insira o e-mail{"\n"}vinculado a sua conta</Text>

                {/* Campo de entrada de e-mail */}
                <View style={styles.inputContainer}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                </View>
                
                {/* Botão Avançar */}
                <TouchableOpacity style={styles.advanceButton} onPress={handleAdvance}>
                <Text style={styles.advanceButtonText}>Avançar</Text>
                </TouchableOpacity>

                {/* Modal de confirmação ou erro */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>
                                {modalMessage} {/* Exibe a mensagem dinamicamente */}
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.modalButtonText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 70,
  },
  backButton: {
    marginRight: 30,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    color: '#000',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  unlockIcon: {
    width: 130,
    height: 150,
  },
  text: {
    fontSize: 23,
    color: '#000',
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
  },
  inputContainer: {
    marginVertical: 20,
  },
  label: {
    fontSize: 20,
    fontFamily: 'Montserrat-Regular',
    color: '#000',
    marginBottom: 7,
    marginLeft: 30,
    marginTop: 15,
  },
  input: {
    height: 40,
    borderColor: '#2222E7',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    color: '#000',
    width: '95%',
    alignSelf: 'center',
    marginBottom: 30,
  },
  advanceButton: {
    backgroundColor: '#0000FF', // Cor de fundo azul
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 30,
    alignSelf: 'center',
    marginTop: 30,
    borderColor: '#0000FF', // Borda azul clara
    borderWidth: 2,
    width: '50%',
  },
  advanceButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo escuro transparente
  },
  modalContent: {
    backgroundColor: '#0000FF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  modalText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Montserrat-Regular',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default PasswordReset;
