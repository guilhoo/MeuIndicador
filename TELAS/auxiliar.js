import React from 'react';
import { ImageBackground, View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';

const LoginScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.registerText}>Registrar-se</Text>
            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/logoAzul.png')}
                    style={styles.logo}
                />
            </View>
            <Text style={styles.loginHeader}>Login para funcionários:</Text>
            
            <View style={styles.inputContainer}>
                <Image
                    source={require('../assets/icon-email.png')}
                    style={styles.icon}
                />
                <TextInput
                    placeholder="Email"
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>
            
            <View style={styles.inputContainer}>
                <Image
                    source={require('../assets/icon-password.png')}
                    style={styles.icon}
                />
                <TextInput
                    placeholder="Senha"
                    style={styles.input}
                    secureTextEntry={true}
                />
            </View>
            
            <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.loginButton}>
                <Text style={styles.loginButtonText}>LOGIN</Text>
            </TouchableOpacity>
            
            <Text style={styles.orText}>----------- Ou -----------</Text>
            
            <TouchableOpacity>
                <Text style={styles.patientLoginText}>Entrar como Paciente</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20, // Adicionando padding ao container para evitar que o texto toque nas bordas da tela
    },
    registerText: {
        position: 'absolute', // Posicionando absolutamente para controlar melhor
        top: 20, // Distância do topo da tela
        right: 20, // Distância da direita da tela
        color: '#0000FF',
        fontSize: 16,
        fontFamily: 'Montserrat-Medium',// Certifique-se de que o nome da fonte corresponde ao nome do arquivo de fonte
    },
    logoContainer: {
        color: '#000000',
        fontFamily: 'Montserrat-Bold',
        marginBottom: 30,
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: 'contain'
    },
    loginHeader: {
        fontSize: 16,
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    input: {
        width: '80%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginLeft: 10,
    },
    icon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    forgotPasswordText: {
        color: 'blue',
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: 'blue',
        width: '90%',
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
        marginBottom: 10,
    },
    loginButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    orText: {
        fontSize: 16,
        color: 'gray',
        marginVertical: 20,
    },
    patientLoginText: {
        color: 'blue',
    }
});

export default LoginScreen;
