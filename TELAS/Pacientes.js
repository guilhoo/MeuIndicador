import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Para navegação
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const PacientesScreen = () => {
  const navigation = useNavigation(); // Navegação para voltar
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar o carregamento
  const [userRole, setUserRole] = useState('');

  // Função para buscar os dados do usuário logado
  const buscarDadosUsuario = async () => {
    try {
      const userId = auth().currentUser.uid; // Pega o UID do usuário logado
      const userDoc = await firestore().collection('users').doc(userId).get();

      if (userDoc.exists) {
        const { role } = userDoc.data();
        setUserRole(role);
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
      await buscarDadosUsuario();
      setIsLoading(false);
    };
    carregarDados();
  }, []);

  // Exibe um indicador de carregamento enquanto os dados são carregados
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000AF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Pacientes</Text>
      </View>

      <Text style={styles.subtitle}>
        Clique para ver as listas de pacientes{"\n"}ou cadastre um novo paciente
      </Text>

      <View style={styles.optionsContainer}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('gravidasList')}>
            <Image source={require('../assets/pregnant.png')} style={styles.icon} />
            <Text style={styles.label}>Grávidas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('criancasList')}>
            <Image source={require('../assets/kids.png')} style={styles.icon} />
            <Text style={styles.label}>Crianças</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('hiperdiaList')}>
            <Image source={require('../assets/hiperdia.png')} style={styles.icon} />
            <Text style={styles.label}>Hiperdia</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('mulheresList')}>
            <Image source={require('../assets/women.png')} style={styles.icon} />
            <Text style={styles.label}>Mulheres</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.containerButton}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AllPacientesList')}>
          <Text style={styles.buttonText}>Todos os Pacientes</Text>
        </TouchableOpacity>

        {/* Botão de Cadastrar Paciente */}
        {userRole !== 'Agente de Saúde' && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('CadastroPacienteScreen')}
          >
            <Text style={styles.buttonText}>Cadastrar Paciente</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
    marginRight: 80,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0000AF',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
    marginVertical: 10,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 10,
    fontFamily: 'Montserrat-SemiBold',
    color: '#000',
    textAlign: 'center',
    marginVertical: 20,
    marginBottom: 40,
  },
  optionsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 130,
    height: 130,
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    marginHorizontal: 15,
    elevation: 3,
  },
  icon: {
    width: 70,
    height: 70,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: '#000',
  },
  containerButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#0000AF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
  },
});

export default PacientesScreen;
