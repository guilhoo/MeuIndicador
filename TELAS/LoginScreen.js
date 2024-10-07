import React, { useState } from 'react';
import { ImageBackground, View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import firestore from '@react-native-firebase/firestore'; // Importa Firestore


function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const LoginScreen = ({navigation}) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {

    // Verifica se o e-mail e a senha foram fornecidos
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Autenticação',
        text2: 'Insira seu e-mail E senha.'
      });
      return;
    }

    if (!validateEmail(email)) {
      alert('Formato de e-mail inválido.');
      return;
    }

    try {
        // Realiza o login do usuário
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const userId = userCredential.user.uid;

      // 🔶 Recupera o tipo de usuário do Firestore
      const userDoc = await firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();

      // Exibe uma mensagem de sucesso
      Toast.show({
        type: 'success',
        text1: 'Login realizado com sucesso!',
      });

      // 🔶 Adiciona um pequeno delay de 1 segundo (1000ms) antes de redirecionar
      setTimeout(() => {
        if (userData.role === 'Enfermeiro') {
          navigation.navigate('HomeEnfermeiro'); // Redireciona para a Home do Enfermeiro
        } else if (userData.role === 'Agente de Saúde') {
          navigation.navigate('HomeAgenteSaude'); // Redireciona para a Home do Agente de Saúde
        }
      }, 1000); // Aguarda 1 segundo antes de redirecionar
    } 

      catch (error) {
      console.error(error);
      let message = 'Erro ao fazer login: ' + error.message;
      switch (error.code) {
        case 'auth/wrong-password':
          message = 'Senha incorreta.';
          break;
        case 'auth/user-not-found':
          message = 'Usuário não encontrado.';
          break;
        case 'auth/invalid-credential':
          message = 'Credenciais inválidas. Verifique e tente novamente.';
          break;
      }
      Toast.show({
        type: 'error',
        text1: 'Autenticação falhou',
        text2: message
      });
    }
  };

    return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <ImageBackground
          source={require('../assets/BackLogin.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
            <Text style={styles.registerText}>Registrar-se</Text>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/logoAzul.png')}
              style={styles.logo}
            />
          </View>

          <Text style={styles.loginHeader}>Login para{"\n"}funcionários:</Text>

          {/*Campo de Email*/}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>E-mail</Text>
            <View style={styles.inputField}>
                <Image
                    source={require('../assets/icon-email.png')}
                    style={styles.inputIconEmail}
                />
                <TextInput
                    style={styles.inputEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
            </View>
          </View>

          {/* Campo de Senha */}
          <View style={styles.inputContainerSenha}>
            <Text style={styles.inputLabel}>Senha</Text>
            <View style={styles.inputField}>
                <Image
                    source={require('../assets/icon-password.png')}
                    style={styles.inputIconSenha}
                />
                <TextInput
                    style={styles.inputSenha}
                    secureTextEntry={true} // Mascara a senha
                    value={password}
                    onChangeText={setPassword}
                />
            </View>
          </View>

          {/* Link Esqueceu a senha? */}
          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={[styles.textWhite, styles.forgotPasswordText]}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          {/* Botão de Login */}
          <TouchableOpacity style={styles.loginButton} onPress={login}>
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>

          {/* Divisor "Ou" */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Botão "Entrar como Paciente" */}
          <TouchableOpacity style={styles.PacienteButton}>
            <Text style={styles.PacienteButtonText}>Entrar como{"\n"}Paciente</Text>
          </TouchableOpacity>
        </ImageBackground>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    backgroundImage: {
        flex: 1,
    },
    registerText: {
        marginTop: 20,
        marginRight: 20,
        textAlign: 'right',
        fontSize: 17,
        fontFamily: 'Montserrat-Medium',
        color: '#000000',
    },
    logo: {
        marginTop: 30,
        marginLeft: 77,
        width: 208,
        height: 147,
        resizeMode: 'contain',
    },
    loginHeader: {
        marginTop: 30,
        marginLeft: 34,
        textAlign: 'left',
        fontSize: 18,
        fontFamily: 'Montserrat-Bold',
        color: '#000000',
    },
    inputContainer: {
        marginTop: 20,
        marginLeft: 36,
        width: '80%',
    },
    inputLabel: {
        color: '#000000',
        fontFamily: 'Montserrat-Regular',
        fontSize: 16,
        marginBottom: 5,
    },
    inputField: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderWidth: 3,
        borderRadius: 20,
        borderColor: '#2222E7',
        paddingHorizontal: 15,
        height: 48,
    },
    inputIconEmail: {
        width: 20,
        height: 15,
        marginRight: 15,
        color: '#bd951c',
    },
    inputEmail: {
        flex: 1,
        height: '100%',
        color: '#000000',
        fontFamily: 'Montserrat-Regular',
    },
    inputSenha: {
        flex: 1,
        height: '100%',
        color: '#000000',
        fontFamily: 'Montserrat-Regular',
    },
    inputContainerSenha: {
        marginTop: 10,
        marginLeft: 36,
        width: '80%',
    },
    inputIconSenha: {
        width: 20,
        height: 27,
        marginRight: 15,
        color: '#bd951c',
    },
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginRight: 50,
        marginTop: 13,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#000000',
        fontFamily: 'Montserrat-Regular',
    },
    loginButton: {
        alignSelf: 'center',
        marginTop: 20,
        backgroundColor: '#2222E7',
        borderRadius: 20,
        width: '50%',
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 15,
    },
    dividerContainer: {
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        width: '80%',
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#2222E7',
    },
    dividerText: {
        color: '#000000',
        paddingHorizontal: 10,
        fontSize: 16,
        fontFamily: 'Montserrat-Medium',
    },
    PacienteButton: {
        alignSelf: 'center',
        marginTop: 0,
        backgroundColor: '#2222E7',
        borderRadius: 20,
        width: '50%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    PacienteButtonText: {
        color: '#FFFFFF',
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 15,
        textAlign: 'center',
    },
});

export default LoginScreen;
