import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore'; // Importa Firestore

const AgentesScreen = ({ navigation }) => {
  const [agentes, setAgentes] = useState([]);
  const [searchText, setSearchText] = useState(''); // Estado para o texto da busca
  const [filteredAgentes, setFilteredAgentes] = useState([]); // Agentes filtrados

  const [isFocused, setIsFocused] = useState(false); // Novo estado para controlar o foco

  useEffect(() => {
    // Busca todos os agentes de saúde do Firestore
    const fetchAgentes = async () => {
      try {
        console.log("Iniciando a busca de agentes..."); // Log inicial
        const agentesSnapshot = await firestore()
          .collection('users')
          .where('role', '==', 'Agente de Saúde')
          .get();

        if (agentesSnapshot.empty) {
          console.log("Nenhum agente de saúde encontrado!"); // Caso não tenha agentes
        } else {
          const agentesList = agentesSnapshot.docs.map(doc => ({
            id: doc.id,
            nome: doc.data().nome, // Pega o nome do agente
          }));
          
          agentesList.sort((a, b) => a.nome.localeCompare(b.nome));
          console.log("Estrutura de agentesList ordenada:", agentesList);
          setAgentes(agentesList);
          setFilteredAgentes(agentesList); // Inicializa lista filtrada
        }
      } catch (error) {
        console.error('Erro ao buscar agentes de saúde:', error);
      }
    };

    fetchAgentes();
  }, []);

  // Efeito para atualizar a lista filtrada ao mudar o texto da busca
  useEffect(() => {
    const filtered = agentes.filter(agente =>
      agente.nome.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredAgentes(filtered);
  }, [searchText, agentes]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Agentes de Saúde</Text>
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
          placeholder="Buscar Agente de Saúde"
          placeholderTextColor={isFocused ? '#fff' : '#fff'}
          value={searchText}
          onChangeText={setSearchText}
          onFocus={() => setIsFocused(true)}  // Define como focado
          onBlur={() => setIsFocused(false)}  // Define como não focado
        />
      </View>

      <View style={styles.agentesContainer}>
        <FlatList
          data={filteredAgentes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('ViewAgente', { id: item.id })}>
              <View style={styles.agenteItem}>
                <Text style={styles.agenteText}>{item.nome}</Text>
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
    marginTop: 20,
  },
  backButton: {
    marginRight: 45,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: '#000000',
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
    marginTop: 20,
  },
  searchIcon: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#fff',
  },
  agentesContainer: {
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
  agenteItem: {
    padding: 15,
  },
  agenteText: {
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
  },
});

export default AgentesScreen;
