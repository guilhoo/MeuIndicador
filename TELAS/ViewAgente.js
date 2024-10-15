import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const fetchMicroareas = async () => {
  try {
    const snapshot = await firestore().collection('microareas').get();
    const microareasList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Microáreas:", microareasList);
  } catch (error) {
    console.error("Erro ao buscar microáreas:", error);
  }
};

const ViewAgenteScreen = ({ route, navigation }) => {
  const { id } = route.params; // Pega o ID do agente vindo da navegação
  const [agente, setAgente] = useState(null); // Estado para armazenar o agente
  const [microarea, setMicroarea] = useState(''); // Estado para a microárea selecionada

  // Busca as informações do agente com base no ID
  useEffect(() => {
    const fetchAgente = async () => {
      try {
        const doc = await firestore().collection('users').doc(id).get();
        if (doc.exists) {
          setAgente(doc.data());
        } else {
          console.error('Agente não encontrado!');
        }
      } catch (error) {
        console.error('Erro ao buscar agente:', error);
      }
    };

    fetchAgente();
  }, [id]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Agentes de Saúde</Text>
      </View>

      {/* Seletor de Microárea */}
      <Text style={styles.label}>Microárea de Atuação</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={microarea}
          style={styles.picker}
          dropdownIconColor="#000" // Define a cor do ícone para preto
        >
          
        </Picker>
      </View>

      {/* Exibição dos dados do agente */}
      {agente && (
        <View style={styles.infoContainer}>
          <Image source={require('../assets/icon-agente.png')} style={styles.agenteIcon} />
          <Text style={styles.nome}>{agente.nome}</Text>

          {/* Verifica se a data de nascimento existe e converte para string */}
          <Text style={styles.info}>
            Data de Nascimento: {agente.dataNascimento ? 
              new Date(agente.dataNascimento._seconds * 1000).toLocaleDateString() : 
              'Data não disponível'}
          </Text>

          <Text style={styles.info}>{agente.email}</Text>
        </View>
      )}
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
    marginBottom: 30,
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 40,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: '#000',
  },
  label: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 5,
    color: '#000000',
  },
  pickerContainer: {
    borderColor: '#0000AF', // Azul
    borderWidth: 2,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    marginTop: 10,
  },
  picker: {
    height: 40,
    width: '100%',
    color: '#000', // Define a cor do texto como preto
  },
  infoContainer: {
    alignItems: 'center',
  },
  agenteIcon: {
    width: 200,
    height: 200,
    marginBottom: 30,
    marginTop: 15
  },
  nome: {
    fontSize: 25,
    fontFamily: 'Montserrat-Bold',
    color: '#000000',
    marginBottom: 5,
  },
  info: {
    fontSize: 18,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 5,
    color: "#000000"
  },
});

export default ViewAgenteScreen;
