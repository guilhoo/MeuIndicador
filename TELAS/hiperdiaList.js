import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const CriancaListScreen = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const [isFocused, setIsFocused] = useState(false); // Novo estado para controlar o foco
  const [searchText, setSearchText] = useState(''); // Estado para o texto da busca
  const [filteredPacientes, setFilteredPacientes] = useState([]); // Pacientes filtrados

  // Função para buscar o nome da microárea pelo ID
  const fetchMicroareaName = async (microareaId) => {
    if (!microareaId) return "Não informado"; // Verificação para casos onde a microárea não está disponível
    try {
      const doc = await firestore().collection('microareas').doc(microareaId).get();
      return doc.exists ? doc.data().Nome : "Não informado";
    } catch (error) {
      console.error('Erro ao buscar nome da microárea:', error);
      return "Erro ao carregar";
    }
  };

  // Função para buscar pacientes e incluir o nome da microárea
  const fetchPacientes = async () => {
    try {
      const snapshot = await firestore().collection('pacientes').where('indicador', '==', 'hiperdia').get();
      const pacientesList = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const microareaNome = await fetchMicroareaName(data.microarea);
        return {
          id: doc.id,
          ...data,
          microareaNome, // Adiciona o nome da microárea ao objeto do paciente
        };
      }));
      pacientesList.sort((a, b) => a.nome.localeCompare(b.nome));
      setPacientes(pacientesList);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarIndicador = (indicador) => {
    switch (indicador) {
      case 'hiperdia':
        return 'Hiperdia';
      case 'crianca':
        return 'Criança';
      case 'gravida':
        return 'Grávida';
      case 'mulher':
        return 'Mulher';
      default:
        return indicador; // Caso não haja correspondência, retorna como está
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  const renderPaciente = ({ item }) => (
    <View style={styles.pacienteItem}>
      <Text style={styles.pacienteNome}>{item.nome}</Text>
      <Text style={styles.pacienteInfo}>CPF: {item.cpf}</Text>
      <Text style={styles.pacienteInfo}>Indicador: {formatarIndicador(item.indicador)}</Text>
    </View>
  );

  // Efeito para atualizar a lista filtrada ao mudar o texto da busca
  useEffect(() => {
    const filtered = pacientes.filter(paciente =>
      paciente.nome.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredPacientes(filtered);
  }, [searchText, pacientes]);

  return (
    <View style={styles.container}>

      <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
          </TouchableOpacity>
        <Text style={styles.title}>Lista de Hiperdia</Text>
      </View>

      {/* Campo de busca */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: isFocused ? '#0000AF' : '#0000AF' }, // Azul ou cinza com base no foco
        ]}
      >
        <Image source={require('../assets/icon-search.png')} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar Paciente"
          placeholderTextColor={isFocused ? '#fff' : '#fff'}
          value={searchText}
          onChangeText={setSearchText}
          onFocus={() => setIsFocused(true)}  // Define como focado
          onBlur={() => setIsFocused(false)}  // Define como não focado
        />
      </View>

      <View style={styles.pacientesContainer}>
        <FlatList
          data={filteredPacientes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('PacienteView', { paciente: item })}>
              <View style={styles.pacienteItem}>
                <Text style={styles.pacienteText}>{item.nome}</Text>
                <Text style={styles.pacienteIndicador}>Indicador: {formatarIndicador(item.indicador)}</Text>
                <Text style={styles.pacienteIndicador}>Microárea: {formatarIndicador(item.microareaNome)}</Text>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => <Text style={styles.emptyText}>Nenhum agente de saúde encontrado.</Text>}
        />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  backButton: {
    marginRight: 20,
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
  searchContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingVertical: -10,
    paddingHorizontal: 15,
    width: '95%',
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Sombra no Android
    marginTop: 10,
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
  pacientesContainer: {
    flex: 1,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  pacienteInfo: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#333',
  },
  pacienteIndicador: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#555',
  },
  pacienteItem: {
    padding: 15,
  },
  pacienteText: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#0000AF',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
    fontFamily: 'Montserrat-Regular',
  },
});

export default CriancaListScreen;
