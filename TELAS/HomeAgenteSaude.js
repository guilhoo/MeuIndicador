import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const HomeAgenteSaude = ({ navigation }) => {

  const [nomeUsuario, setNomeUsuario] = useState('');

  // Função para buscar o nome do Firestore
  const buscarNomeUsuario = async () => {
    try {
      const userId = auth().currentUser.uid; // Pega o UID do usuário logado
      const userDoc = await firestore().collection('users').doc(userId).get();
      const nomeCompleto = userDoc.data().nome;

      // Extrai o primeiro e o segundo nome
      const nomePartes = nomeCompleto.split(' ');
      const primeiroNome = nomePartes[0];
      const segundoNome = nomePartes.length > 1 ? nomePartes[1] : '';

      setNomeUsuario(`${primeiroNome} ${segundoNome}`);
    } catch (error) {
      console.error("Erro ao buscar o nome do usuário:", error);
    }
  };

  // Carrega o nome do usuário quando a tela é montada
  useEffect(() => {
    buscarNomeUsuario();
  }, []);

  return (
    <ImageBackground
      source={require('../assets/BackLogin.png')}  // Usando a mesma imagem de fundo do login
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Linha com Logo, Texto e Notificação */}
      {/* Linha com Logo, Texto e Notificação */}
      <View style={styles.headerContainer}>
        {/* Logo no canto esquerdo */}
        <Image 
          source={require('../assets/logoAzul.png')} 
          style={styles.logo}
        />
        
        {/* Texto "Olá, Nome" */}
        <Text style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Olá, </Text>
          <Text style={styles.nameText}>{nomeUsuario}</Text>
        </Text>

        {/* Botão de Notificação no canto direito */}
        <TouchableOpacity style={styles.notificationButton} onPress={() => alert('Notificação clicada!')}>
          <Image 
            source={require('../assets/notificacao.png')} 
            style={styles.notificationIcon}
          />
        </TouchableOpacity>
      </View>

        {/* Imagem dos enfermeiros */}
        <View style={styles.iconContainer}>
          <Image 
            source={require('../assets/icon-home-agentes.png')}
            style={styles.enfermeirosIcon}
          />
        </View>

        {/* Botão Relatórios e Gráficos */}
        <TouchableOpacity style={styles.button} onPress={() => alert('Relatórios e Gráficos')}>
          <Text style={styles.buttonText}>Relatórios e Gráficos</Text>
        </TouchableOpacity>

        {/* Botão Relatórios e Gráficos */}
        <TouchableOpacity style={styles.button} onPress={() => alert('Pacientes')}>
          <Text style={styles.buttonText}>Pacientes</Text>
        </TouchableOpacity>

        {/* Botão Sair */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>Sair</Text>
        </TouchableOpacity>

    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',  // Alinha os itens na mesma linha
    alignItems: 'center',  // Centraliza verticalmente
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
    marginBottom: -15,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  logo: {
    width: 40,  // Tamanho da logo
    height: 40,
    resizeMode: 'contain',
    marginRight: 10,
  },
  welcomeText: {
    fontSize: 18,
    color: '#000',
    fontFamily: 'Montserrat-Regular',  // Fonte para o "Olá"
  },
  nameText: {
    fontSize: 15,
    color: '#000',
    fontFamily: 'Montserrat-Bold',  // Fonte para o "Nome"
  },
  notificationButton: {
    marginLeft: 'auto',  // Empurra o botão de notificação para o canto direito
    padding: 5,  // Aumenta a área de toque do botão
  },
  notificationIcon: {
    width: 30,  // Tamanho do ícone de notificação
    height: 30,
    resizeMode: 'contain',
  },
  iconContainer: {
    marginTop: 0,  // Adiciona espaço entre o header e a imagem
    alignItems: 'center',  // Centraliza a imagem no meio da tela
  },
  enfermeirosIcon: {
    width: 350,  // Tamanho da imagem (ajuste conforme necessário)
    height: 350,
    resizeMode: 'contain',
    marginTop: 40,
    marginBottom: 50,
  },
  button: {
    marginTop: 10,  // Espaçamento entre a imagem e o botão
    backgroundColor: '#2222E7',  // Cor do botão
    borderRadius: 20,            // Bordas arredondadas
    width: '80%',                // Largura do botão
    height: 40,                  // Altura do botão
    justifyContent: 'center',    // Centraliza o texto verticalmente
    alignItems: 'center',        // Centraliza o texto horizontalmente
    alignSelf: 'center',         // Centraliza o botão na tela
  },
  buttonText: {
    color: '#FFFFFF',            // Cor do texto do botão
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',  // Fonte do texto
  },
  exitButton: {
    marginTop: 40,
    alignSelf: 'center',  // Centraliza o botão Sair
  },
  exitButtonText: {
    color: '#000000',  // Cor preta para o texto
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',  // Fonte com negrito
  },
});

export default HomeAgenteSaude;
