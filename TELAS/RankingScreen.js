import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const TelaRanking = ({ navigation }) => {
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [userRole, setUserRole] = useState('');
  const [nivel, setNivel] = useState(1);
  const [pontos, setPontos] = useState(0);
  const [iconPath, setIconPath] = useState(require('../assets/w-icon.png')); // Ícone padrão
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar o carregamento
  const [usuarios, setUsuarios] = useState([]);

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

  // Função para buscar todos os usuários do Firestore
  const buscarTodosUsuarios = async () => {
    try {
      const snapshot = await firestore().collection('users').get();
      const listaUsuarios = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id, // ID do documento
          nome: data.nome || 'Sem Nome', // Nome do usuário (padrão "Sem Nome")
          pontos: data.gamification?.pontos || 0, // Pontos do usuário (padrão 0)
        };
      });

      // Log da lista de usuários
      console.log('Lista de Usuários:', listaUsuarios);

      // Ordena os usuários por pontos em ordem decrescente
    listaUsuarios.sort((a, b) => b.pontos - a.pontos);
    setUsuarios(listaUsuarios); // Atualiza o estado com a lista de usuários
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
  }};

  // Busca os dados do usuário ao montar o componente
  useEffect(() => {
    const carregarDados = async () => {
      setIsLoading(true);
      await buscarDadosUsuario(); // Busca os dados do usuário logado
      const usuarios = await buscarTodosUsuarios(); // Busca todos os usuários e registra no log
      console.log('Usuários Ordenados:', usuarios); // Confirma a lista no console
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

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Ranking</Text>
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
      <FlatList
        data={usuarios}
        keyExtractor={(item, index) => index.toString()} // Usa o índice como chave
        renderItem={({ item, index }) => (
          <View style={styles.usuarioContainer}>
            {/* Número da posição */}
            {/* Ícone ou posição */}
            {index === 0 && (
              <Image source={require('../assets/first-icon.png')} style={styles.rankIcon} />
            )}
            {index === 1 && (
              <Image source={require('../assets/second-icon.png')} style={styles.rankIcon} />
            )}
            {index === 2 && (
              <Image source={require('../assets/third-icon.png')} style={styles.rankIcon} />
            )}
            {index > 2 && <Text style={styles.rankText}>{index + 1}</Text>}
            
            {/* Nome do usuário com destaque para o logado */}
            <Text
              style={[
                styles.nomeUsuario,
                item.nome === nomeUsuario && styles.nomeUsuarioLogado, // Estilo condicional
              ]}
            >
              {item.nome}
            </Text>

            {/* Pontos do usuário */}
            <Text style={styles.pontosUsuario}>{item.pontos}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />} // Adiciona o separador
      />
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
            <Image source={require('../assets/roadmap-icon2.png')} style={styles.menuIcon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Ranking')} style={styles.menuItem}>
            <Image source={require('../assets/ranking-icon.png')} style={styles.menuIcon} />
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
    width: '80%',
    height: '53%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // Para sombra em dispositivos Android
    alignSelf: 'center',
  },
  usuarioContainer: {
    flexDirection: 'row',
    marginVertical: 20,
  },
  rankIcon: {
    width: 20,
    height: 30,
    marginRight: 20,
  }, 
  rankText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#333',
    marginRight: 25,
    marginLeft: 5,
  },
  nomeUsuario: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#333',
    flex: 1, // Faz com que o nome ocupe o espaço restante
  },
  nomeUsuarioLogado: {
    color: '#0000AF', // Cor azul para o nome do usuário logado
    fontFamily: 'Montserrat-Bold',
  },
  pontosUsuario: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333',
    textAlign: 'right', // Alinha os pontos à direita
  }, 
  separator: {
    height: 1, // Espessura da linha
    backgroundColor: '#CCC', // Cor da linha
    marginHorizontal: 10, // Margem horizontal para criar espaço dos lados
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
  }
});

export default TelaRanking;
