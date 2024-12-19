import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native'; // Import para Alert

const TelaConquista = ({ navigation }) => {
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [userRole, setUserRole] = useState('');
  const [nivel, setNivel] = useState(1);
  const [pontos, setPontos] = useState(0);
  const [iconPath, setIconPath] = useState(require('../assets/w-icon.png')); // Ícone padrão
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar o carregamento
  const [medalhas, setMedalhas] = useState([]); // Estado para armazenar as medalhas

  
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
        setMedalhas(gamification?.medalhas || []); // Define as medalhas

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

   // Lista com todas as medalhas e suas imagens
   const todasMedalhas = [
    { nome: 'Conquista de Boas Vindas', color: require('../assets/medals/medal-boas-vindas-color.png'), gray: require('../assets/medals/medal-boas-vindas-gray.png') },
    { nome: 'Apoio à Saúde', color: require('../assets/medals/medal-apoio-color.png'), gray: require('../assets/medals/medal-apoio-gray.png') },
    { nome: 'Cuidador Odontológico', color: require('../assets/medals/medal-cuidador-color.png'), gray: require('../assets/medals/medal-cuidador-gray.png') },
    { nome: 'Herói dos Pequeninos', color: require('../assets/medals/medal-heroi-color.png'), gray: require('../assets/medals/medal-heroi-gray.png') },
    { nome: 'Monitor de Pressão', color: require('../assets/medals/medal-monitor-color.png'), gray: require('../assets/medals/medal-monitor-gray.png') },
    { nome: 'Combatente do Diabetes', color: require('../assets/medals/medal-combatente-color.png'), gray: require('../assets/medals/medal-combatente-gray.png') },
    { nome: 'Proativo no Pré-natal', color: require('../assets/medals/medal-proativo-color.png'), gray: require('../assets/medals/medal-proativo-gray.png') },
    { nome: 'Saúde Feminina', color: require('../assets/medals/medal-facilitador-color.png'), gray: require('../assets/medals/medal-facilitador-gray.png') },
    { nome: 'Maioral do Indicador', color: require('../assets/medals/medal-maioral-color.png'), gray: require('../assets/medals/medal-maioral-gray.png') },
  ];

  // Mapeamento das medalhas e suas descrições
  const medalhasDetalhes = {
    'Conquista de Boas Vindas': {
      conquistada: 'Você já obteve a medalha "Conquista de Boas Vindas" por fazer o primeiro login no sistema!',
      naoConquistada: 'Para obter a medalha "Conquista de Boas Vindas", basta fazer seu primeiro login no sistema.',
    },
    'Apoio à Saúde': {
      conquistada: 'Você já obteve a medalha "Apoio à Saúde" por registrar 10 exames de IST em grávidas.',
      naoConquistada: 'Para obter a medalha "Apoio à Saúde", registre 10 exames de IST em grávidas.',
    },
    'Cuidador Odontológico': {
      conquistada: 'Você já obteve a medalha "Cuidador Odontológico" por registrar atendimento odontológico de 5 gestantes.',
      naoConquistada: 'Para obter a medalha "Cuidador Odontológico", registre atendimento odontológico de pelo menos 5 gestantes.',
    },
    'Herói dos Pequeninos': {
      conquistada: 'Você já obteve a medalha "Herói dos Pequeninos" por vacinar 10 crianças.',
      naoConquistada: 'Para obter a medalha "Guardião da Saúde", vacine pelo menos 10 crianças.',
    },
    'Monitor de Pressão': {
      conquistada: 'Você já obteve a medalha "Guardião da Saúde" por vacinar 10 crianças.',
      naoConquistada: 'Para obter a medalha "Guardião da Saúde", vacine pelo menos 10 crianças.',
    },
    'Combatente do Diabetes': {
      conquistada: 'Você já obteve a medalha "Guardião da Saúde" por vacinar 10 crianças.',
      naoConquistada: 'Para obter a medalha "Guardião da Saúde", vacine pelo menos 10 crianças.',
    },
    'Proativo no Pré-natal': {
      conquistada: 'Você já obteve a medalha "Guardião da Saúde" por vacinar 10 crianças.',
      naoConquistada: 'Para obter a medalha "Guardião da Saúde", vacine pelo menos 10 crianças.',
    },
    'Saúde Feminina': {
      conquistada: 'Você já obteve a medalha "Guardião da Saúde" por vacinar 10 crianças.',
      naoConquistada: 'Para obter a medalha "Guardião da Saúde", vacine pelo menos 10 crianças.',
    },
    'Maioral do Indicador': {
      conquistada: 'Você já obteve a medalha "Maioral do Indicador" por alcançar o topo do ranking.',
      naoConquistada: 'Para obter a medalha "Maioral do Indicador", alcance o topo do ranking.',
    },
  };

  // Função para exibir mensagens específicas da medalha
  const exibirInformacao = (medalha, tipo) => {
    const detalhes = medalhasDetalhes[medalha.nome];

    if (detalhes) {
      const mensagem =
        tipo === 'color'
          ? detalhes.conquistada // Mensagem se já conquistada
          : detalhes.naoConquistada; // Mensagem se não conquistada

      Alert.alert('Informação da Medalha', mensagem, [{ text: 'OK' }]);
    } else {
      Alert.alert('Erro', 'Detalhes da medalha não encontrados.', [{ text: 'OK' }]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Conquistas</Text>
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
          <Text style={styles.suasConquitas}>Suas Conquitas:</Text>
          <View style={styles.medalContainer}>
            <FlatList
              data={todasMedalhas}
              keyExtractor={(item) => item.nome}
              numColumns={3} // Organiza as medalhas em 3 colunas
              renderItem={({ item }) => {

                // Verifica se o usuário possui todas as outras medalhas para habilitar "Maioral do Indicador"
                const todasExcetoMaioral = todasMedalhas
                .filter((medal) => medal.nome !== 'Maioral do Indicador') // Exclui "Maioral do Indicador"
                .map((medal) => medal.nome); // Pega os nomes das outras medalhas

                const temTodasAsMedalhas = todasExcetoMaioral.every((nome) => medalhas.includes(nome)); // Verifica se o usuário tem todas as outras medalhas

                // Lógica de exibição para cada medalha
                const isConquistada =
                  item.nome === 'Conquista de Boas Vindas' // "Conquista de Boas Vindas" sempre colorida
                  || (item.nome === 'Maioral do Indicador' && temTodasAsMedalhas) // "Maioral do Indicador" colorida se todas as outras foram conquistadas
                  || medalhas.includes(item.nome); // Outras medalhas com base na lista do banco

                return (
                  <View style={styles.medalItem}>
                      <TouchableOpacity
                        onPress={() =>
                          exibirInformacao(item, isConquistada ? 'color' : 'gray') // Passa a medalha e o tipo
                        }
                      >
                        <Image
                          source={isConquistada ? item.color : item.gray} // Mostra colorida ou cinza
                          style={styles.medalImage}
                        />
                      </TouchableOpacity>
                    <Text style={styles.medalText}>
                    {item.nome
                      .replace('Conquista de Boas Vindas', 'Conquista de\nBoas Vindas') // Substitui "de" por uma quebra de linha
                      .replace(' de ', '\nde ') // Substitui "de" por uma quebra de linha
                      .replace(' à ', '\nà ') // Substitui "à" por uma quebra de linha
                      .replace(' Odontológico', '\nOdontológico')
                      .replace('Guardião da Saúde', 'Guardão da\nSaúde')
                      .replace('Combatente do Diabetes', 'Combatente \ndo Diabetes')
                      .replace('Proativo no Pré-natal', 'Proativo no\nPré-natal')
                      .replace('Maioral do Indicador', 'Maioral do\nIndicador')}
                      </Text>
                  </View>
                );
              }}
            />
          </View>
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
            <Image source={require('../assets/conquista-icon.png')} style={styles.bottomconquista} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('RoadMap')} style={styles.menuItem}>
            <Image source={require('../assets/roadmap-icon2.png')} style={styles.menuIcon} />
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
  },
  suasConquitas: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#000',
    padding: 10,
  },
  medalContainer: {
    flex: 1,
    padding: 10,
  },
  medalItem: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  medalImage: {
    width: 50,
    height: 50,
  },
  medalText: {
    marginTop: 5,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14, // Melhora o espaçamento entre as linhas
    color: "#000",
    fontFamily: 'Montserrat-Regular',
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

export default TelaConquista;
