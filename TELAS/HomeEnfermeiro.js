import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const HomeEnfermeiro = ({ navigation }) => {

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
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        {/* Logo no canto esquerdo */}
        <Image 
          source={require('../assets/logoBranca.png')} 
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
            source={require('../assets/notificacao_branca.png')} 
            style={styles.notificationIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Imagem dos enfermeiros */}
      <View style={styles.iconContainer}>
          <Image 
            source={require('../assets/icon-home-enfermeiros.png')}
            style={styles.enfermeirosIcon}
          />
      </View>

      {/* Barra inferior com conquistas */}
      <View style={styles.bottomBar}>
        {/* Nível */}
        <View style={styles.infoItem}>
          <Image source={require('../assets/nivel-icon.png')} style={styles.nivelIcon} />
          <Text style={styles.infoText}>3</Text>
          <Text style={styles.infoLabel}>Nível</Text>
        </View>

        <View style={styles.divider} />

        {/* Conquistas */}
        <View style={styles.infoItem}>
          <Image source={require('../assets/conquistas-icon.png')} style={styles.conquistaIcon} />
          <Text style={styles.infoText}>10</Text>
          <Text style={styles.infoLabel}>Conquistas</Text>
        </View>

        <View style={styles.divider} />

        {/* Pontos */}
        <View style={styles.infoItem}>
          <Image source={require('../assets/pontos-icon.png')} style={styles.pontosIcon} />
          <Text style={styles.infoText}>13</Text>
          <Text style={styles.infoLabel}>Pontos</Text>
        </View>
      </View>

      <View style={styles.whiteContainer}>
      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Pacientes')}>
          <Image source={require('../assets/icon-pacientes.png')} style={styles.optionIcon} />
          <Text style={styles.optionText}>Pacientes</Text>
        </TouchableOpacity>

        {/* Linha Divisória */}
        <View style={styles.divider2} />

        {/* Opção Microáreas */}
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Microareas')}>
          <Image source={require('../assets/icon-microareas.png')} style={styles.optionIcon} />
          <Text style={styles.optionText}>Microáreas</Text>
        </TouchableOpacity>

        {/* Linha Divisória */}
        <View style={styles.divider2} />

        {/* Opção Agentes de Saúde */}
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Agentes')}>
          <Image source={require('../assets/icon-agentes.png')} style={styles.optionIcon} />
          <Text style={styles.optionText}>Agentes de Saúde</Text>
        </TouchableOpacity>

        {/* Linha Divisória */}
        <View style={styles.divider2} />

        {/* Opção Relatório */}
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Relatorios')}>
          <Image source={require('../assets/icon-relatorio.png')} style={styles.optionIcon} />
          <Text style={styles.optionText}>Relatórios</Text>
        </TouchableOpacity>

        <View style={styles.bottomMenu}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.menuItem}>
            <Image source={require('../assets/home-icon.png')} style={styles.menuIcon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Conquista')} style={styles.menuItem}>
            <Image source={require('../assets/conquista-icon.png')} style={styles.menuIcon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('RoadMap')} style={styles.menuItem}>
            <Image source={require('../assets/roadmap-icon.png')} style={styles.menuIcon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Ranking')} style={styles.menuItem}>
            <Image source={require('../assets/ranking-icon.png')} style={styles.menuIcon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.menuItem}>
            <Image source={require('../assets/logout-icon.png')} style={styles.menuIcon} />
          </TouchableOpacity>
        </View>

      </View>

      

    </ScrollView>  
  );
};  

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0000AF',
    flex: 1,
    width: '100%',
    height: '100%',
  },
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
    color: '#FAFAFA',
    fontFamily: 'Montserrat-Regular',  // Fonte para o "Olá"
  },
  nameText: {
    fontSize: 15,
    color: '#FAFAFA',
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
    alignItems: 'center',  // Centraliza a imagem no meio da tela
  },
  enfermeirosIcon: {
    width: 210,  // Tamanho da imagem (ajuste conforme necessário)
    height: 210,
    resizeMode: 'contain',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  infoItem: {
    alignItems: 'center',
  },
  nivelIcon: {
    width: 26,
    height: 29,
    marginBottom: 3,
  },
  conquistaIcon: {
    width: 29,
    height: 30,
    marginBottom: 3,
  },
  pontosIcon: {
    width: 30,
    height: 32,
    marginBottom: 3,
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#fff',
  },
  infoLabel: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Montserrat-Regular',
  },
  divider: {
    width: 1, // Largura da linha vertical
    height: '60%', // Altura relativa aos itens
    backgroundColor: '#fff', // Cor branca para combinar com o design
    alignSelf: 'flex-end',
  },
  whiteContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 40,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Sombra no Android
    marginTop: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    marginLeft: 30,
  },
  optionText: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Montserrat-Bold',  // Fonte para o "Nome"
  },
  divider2: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
    width: '80%',
    marginLeft: 30,
  },
  bottomMenu: {
    flexDirection: 'row',
    marginTop: 20,  // Espaçamento entre a imagem e o botão
    backgroundColor: '#E2E1E1',  // Cor do botão
    borderRadius: 20,            // Bordas arredondadas
    width: '80%',                // Largura do botão
    height: 40,                  // Altura do botão
    justifyContent: 'space-around',
    alignItems: 'center',        // Centraliza o texto horizontalmente
    alignSelf: 'center', 
  },
  menuItem: {
    alignItems: 'center',
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  menuText: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
});

export default HomeEnfermeiro;
