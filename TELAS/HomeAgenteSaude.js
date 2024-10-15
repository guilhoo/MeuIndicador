import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '../firebaseConfig'; // Certifique-se de que o Firebase está configurado corretamente

const AgentesScreen = ({ navigation }) => {
  const [agentes, setAgentes] = useState([]);
  const [filteredAgentes, setFilteredAgentes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Função para buscar os agentes de saúde no Firestore
    const fetchAgentes = async () => {
      try {
        const db = getFirestore(app);
        const q = query(collection(db, 'users'), where('role', '==', 'Agente de Saúde'));
        const agentesSnapshot = await getDocs(q);
        const agentesList = agentesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAgentes(agentesList);
        setFilteredAgentes(agentesList); // Inicialmente a lista é igual
      } catch (error) {
        console.error("Erro ao buscar agentes de saúde: ", error);
      }
    };

    fetchAgentes();
  }, []);

  useEffect(() => {
    // Filtra a lista conforme o usuário digita
    if (searchQuery === '') {
      setFilteredAgentes(agentes); // Mostra todos quando o campo de busca está vazio
    } else {
      const filtered = agentes.filter(agente =>
        agente.nome.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAgentes(filtered);
    }
  }, [searchQuery, agentes]);

  return (
    <View style={styles.container}>
      {/* Header com ícone de voltar e título */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Agentes de Saúde</Text>
      </View>

      {/* Campo de busca */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar Agente de Saúde"
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
        />
      </View>

      {/* Lista de Agentes */}
      <FlatList
        data={filteredAgentes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.nome}</Text>
          </View>
        )}
      />
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
  },
  backButton: {
    marginRight: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 18,
    color: '#0000FF', // Cor azul conforme o exemplo
    textAlign: 'left', // Para alinhar o texto à esquerda
  },
});

export default AgentesScreen;
