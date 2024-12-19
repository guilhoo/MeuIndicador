import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ImageBackground, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { ScrollView } from 'react-native-gesture-handler';

const RoadMapScreen = ({ navigation }) => {

  const [nomeUsuario, setNomeUsuario] = useState('');
  const [userRole, setUserRole] = useState('');
  const [nivel, setNivel] = useState(1);
  const [pontos, setPontos] = useState(0);
  const [iconPath, setIconPath] = useState(require('../assets/w-icon.png')); // Ícone padrão
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar o carregamento

  // Função para buscar os dados do usuário logado
  const buscarDadosUsuario = async () => {
    try {
      const userId = auth().currentUser.uid; // Pega o UID do usuário logado
      const userDoc = await firestore().collection('users').doc(userId).get();

      if (userDoc.exists) {
        const { nome, gamification, genero, role } = userDoc.data();
        setNomeUsuario(nome);
        setUserRole(role);
        setNivel(gamification?.nivel || 1);
        setPontos(gamification?.pontos || 0);

        // Define o ícone com base no gênero
        const icon = genero === 'Masculino'
          ? require('../assets/m-icon.png')
          : require('../assets/w-icon.png');
        setIconPath(icon);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    } finally {
      setIsLoading(false); // Finaliza o carregamento
    }
  };

  // Busca os dados do usuário ao montar o componente
  useEffect(() => {
    const carregarDados = async () => {
      setIsLoading(true);
      await buscarDadosUsuario(); // Busca os dados do usuário logado
      setIsLoading(false);
    };
    carregarDados();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  const niveis = [
    {
      numero: 1,
      nome: 'Iniciante',
      iconColor: require('../assets/niveis/nivel1-color.png'),
      iconGray: require('../assets/niveis/nivel1-gray.png'),
      descricao: 'De 0 a 50 pontos.',
    },
    {
      numero: 2,
      nome: 'Aprendiz',
      iconColor: require('../assets/niveis/nivel2-color.png'),
      iconGray: require('../assets/niveis/nivel2-gray.png'),
      descricao: 'De 51 a 100 pontos.',
    },
    {
      numero: 3,
      nome: 'Colaborador',
      iconColor: require('../assets/niveis/nivel3-color.png'),
      iconGray: require('../assets/niveis/nivel3-gray.png'),
      descricao: 'De 101 a 150 pontos.',
    },
    {
      numero: 4,
      nome: 'Conhecedor',
      iconColor: require('../assets/niveis/nivel4-color.png'),
      iconGray: require('../assets/niveis/nivel4-gray.png'),
      descricao: 'De 151 a 200 pontos.',
    },
    {
      numero: 5,
      nome: 'Experiente',
      iconColor: require('../assets/niveis/nivel5-color.png'),
      iconGray: require('../assets/niveis/nivel5-gray.png'),
      descricao: 'De 201 a 250 pontos.',
    },
    {
      numero: 6,
      nome: 'Especialista',
      iconColor: require('../assets/niveis/nivel6-color.png'),
      iconGray: require('../assets/niveis/nivel6-gray.png'),
      descricao: 'De 251 a 300 pontos.',
    },
    {
      numero: 7,
      nome: 'Líder',
      iconColor: require('../assets/niveis/nivel7-color.png'),
      iconGray: require('../assets/niveis/nivel7-gray.png'),
      descricao: 'De 301 a 400 pontos.',
    },
    {
      numero: 8,
      nome: 'Mestre',
      iconColor: require('../assets/niveis/nivel8-color.png'),
      iconGray: require('../assets/niveis/nivel8-gray.png'),
      descricao: 'De 401 a 500 pontos.',
    },
    {
      numero: 9,
      nome: 'Guardião da UBS',
      iconColor: require('../assets/niveis/nivel9-color.png'),
      iconGray: require('../assets/niveis/nivel9-gray.png'),
      descricao: 'De 501 a 600 pontos.',
    },
    {
      numero: 10,
      nome: 'Campeão da\nSaúde Pública',
      iconColor: require('../assets/niveis/nivel10-color.png'),
      iconGray: require('../assets/niveis/nivel10-gray.png'),
      descricao: 'A partir de 600 pontos.',
    },
  ];

  const renderizarNiveis = (nivelAtual) => {
    return niveis.map((nivel) => ({
      ...nivel,
      icon: nivel.numero <= nivelAtual ? nivel.iconColor : nivel.iconGray,
    }));
  };

  const exibirDescricaoNivel = (nivel) => {
    Alert.alert(
      `Descrição do Nível ${nivel.numero}`,
      nivel.descricao,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Mapa de Níveis</Text>
      </View>

      {/* Informações do Usuário */}
      <View style={styles.userContainer}>
        <View style={styles.userInfo}>
          <Text style={styles.levelText}>Nível</Text>
          <Text style={styles.levelNumber}>{nivel}</Text>
          <Text style={styles.pointsText}>Pontos</Text>
          <Text style={styles.pointsNumber}>{pontos}</Text>
        </View>

        <View style={styles.userIconContainer}>
          <Image
            source={iconPath} // Ícone dinâmico baseado no gênero
            style={styles.userIcon}
          />
          <Text style={styles.userName}>{nomeUsuario}</Text>
        </View>
      </View>

      {/* Retângulo Branco com Bordas Arredondadas */}
      <View style={styles.whiteBox}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Image source={require('../assets/start.png')} style={styles.startIcon} />
          <ImageBackground
            source={require('../assets/linha-tracejada.png')}
            style={styles.background}
            resizeMode="contain"
          >
  
            {renderizarNiveis(nivel).map((nivelData, index) => (
                <TouchableOpacity
                  key={nivelData.numero}
                  onPress={() => exibirDescricaoNivel(nivelData)}
                  style={[
                    styles.nivelContainer,
                    index % 2 === 0 ? styles.leftAlign1 : styles.rightAlign2,
                    nivelData.numero === 3 && styles.nivelEspecial3,
                    nivelData.numero === 5 && styles.nivelEspecial5,
                    nivelData.numero === 7 && styles.nivelEspecial7,
                    nivelData.numero === 9 && styles.nivelEspecial9,    
                    nivelData.numero === 10 && styles.nivelEspecial10,    
                 
                  ]}
                >
                  {index % 2 === 0 ? (
                    <>
                      <Image source={nivelData.icon} style={styles.nivelIcon} />
                      <View style={styles.textWrapperLeft}>
                        <Text
                          style={[
                            styles.nivelText,
                            nivelData.numero > nivel && styles.nivelTextDisabled, // Troca a cor se o nível ainda não foi alcançado
                          ]}
                        >
                          Nível {nivelData.numero}
                        </Text>
                        <Text
                          style={[
                            styles.nivelNomeText,
                            nivelData.numero > nivel && styles.nivelTextDisabled, // Troca a cor se o nível ainda não foi alcançado
                          ]}
                        >
                          {nivelData.nome}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.textWrapperRight}>
                        <Text
                          style={[
                            styles.nivelText,
                            nivelData.numero > nivel && styles.nivelTextDisabled, // Troca a cor se o nível ainda não foi alcançado
                          ]}
                        >
                          Nível {nivelData.numero}
                        </Text>
                        <Text
                          style={[
                            styles.nivelNomeText,
                            nivelData.numero > nivel && styles.nivelTextDisabled, // Troca a cor se o nível ainda não foi alcançado
                          ]}
                        >
                          {nivelData.nome}
                        </Text>
                      </View>
                      <Image source={nivelData.icon} style={styles.nivelIcon} />
                    </>
                  )}
                </TouchableOpacity>
              ))}

          <Image source={require('../assets/end.png')} style={styles.endIcon} />
          </ImageBackground>
        </ScrollView>
      </View>

      <View style={styles.bottomMenu}>
          <TouchableOpacity onPress={() => {
                      if (userRole === 'Agente de Saúde') {
                        navigation.navigate('HomeAgenteSaude');
                      } else {
                        navigation.navigate('HomeEnfermeiro');
                      }
                    }}
                    style={styles.menuItem}
                  >
            <Image source={require('../assets/home-icon2.png')} style={styles.menuIcon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Conquista')} style={styles.menuItem}>
            <Image source={require('../assets/conquista-icon2.png')} style={styles.bottomconquista} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('RoadMap')} style={styles.menuItem}>
            <Image source={require('../assets/roadmap-icon.png')} style={styles.menuIcon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Ranking')} style={styles.menuItem}>
            <Image source={require('../assets/ranking-icon2.png')} style={styles.menuIcon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.menuItem}>
            <Image source={require('../assets/logout-icon.png')} style={styles.exitIcon} />
          </TouchableOpacity>
        </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0000AF', // Cor de fundo da tela fora do azul
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0000AF',
  },
  header: {
    paddingVertical: 15,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: '#FFF',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  userInfo: {
    alignItems: 'center', // Alinha os itens ao centro horizontalmente
    marginRight: 20,
  },
  levelText: {
    fontSize: 25,
    color: '#FFF',
    fontFamily: 'Montserrat-Bold',
  },
  levelNumber: {
    fontSize: 20,
    color: '#FFF',
    fontFamily: 'Montserrat-Regular',
  },
  pointsText: {
    fontSize: 25,
    color: '#FFF',
    fontFamily: 'Montserrat-Bold',
    marginTop: 10,
  },
  pointsNumber: {
    fontSize: 20,
    color: '#FFF',
    fontFamily: 'Montserrat-Regular',
  },
  userIconContainer: {
    alignItems: 'center',
  },
  userIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: 18,
    color: '#FFF',
    fontFamily: 'Montserrat-Bold',
    marginTop: 10,
  },
  whiteBox: {
    flex: 1,
    width: '80%',
    height: '53%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // Para sombra em dispositivos Android
    alignSelf: 'center',
    overflow: 'hidden',
  },
  background: {
    width: '100%',
    height: 1200,
    marginBottom: 40,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  startIcon: {
    width: 24,
    height: 24,
    marginTop: 20,
    alignSelf: 'center',
  },
  endIcon: {
    position: 'absolute',
    bottom: -5, // Posiciona no final
    left: '53%',
    transform: [{ translateX: -20 }], // Ajusta para centralizar
    width: 24,
    height: 24,
    zIndex: 2,
  },
  nivelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  leftAlign1: {
    justifyContent: 'flex-start',
    paddingLeft: 30,
    paddingTop: 20,
  },
  rightAlign2: {
    justifyContent: 'flex-end',
    paddingRight: 30,
    paddingTop: 30,
  },
  nivelIcon: {
    width: 50,
    height: 50,
    marginHorizontal: 10,
  },
  textWrapperLeft: {
    alignItems: 'flex-start',
     // Alinha o texto à esquerda
  },
  textWrapperRight: {
    alignItems: 'flex-end', // Alinha o texto à direita
  },
  nivelText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#000',
  },
  nivelNomeText:{
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#000',
    textAlign: 'right', // Garante alinhamento correto
  },
  nivelTextDisabled: {
    color: '#B0B0B0', // Cor cinza para níveis não alcançados
  },
  nivelEspecial3: {
    paddingTop: 30, 
  },
  nivelEspecial4: {
    paddingTop: 40, 
  },
  nivelEspecial5: {
    paddingTop: 25, 
  },
  nivelEspecial6: {
    paddingTop: 40, 
  },
  nivelEspecial7: {
    paddingTop: 25, 
  },
  nivelEspecial8: {
    paddingTop: 40, 
  },
  nivelEspecial9: {
    paddingTop: 30,
  },
  nivelEspecial10: {
    paddingTop: 20,
  },
  bottomMenu: {
    flexDirection: 'row',
    marginTop: 20,  // Espaçamento entre a imagem e o botão
    backgroundColor: '#fff',  // Cor do botão
    borderRadius: 20,            // Bordas arredondadas
    width: '75%',                // Largura do botão
    height: 40,                  // Altura do botão
    justifyContent: 'space-around',
    alignItems: 'center',        // Centraliza o texto horizontalmente
    alignSelf: 'center',
    marginBottom: 20, 
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
  bottomconquista: {
    width: 35,
    height: 20,
  },
  exitIcon: {
    width: 22,
    height: 20,
  },
});

export default RoadMapScreen;
