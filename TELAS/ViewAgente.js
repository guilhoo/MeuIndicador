import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const ViewAgenteScreen = ({ route, navigation }) => {
  const { id } = route.params; // Pega o ID do agente vindo da navegação
  const [agente, setAgente] = useState(null); // Estado para armazenar o agente
  const [microarea, setMicroarea] = useState(''); // Estado para a microárea associada

  // Busca as informações do agente e verifica em qual microárea ele está
  useEffect(() => {
    const fetchAgenteEMicroarea = async () => {
      try {
        const agenteDoc = await firestore().collection('users').doc(id).get();
        if (agenteDoc.exists) {
          setAgente(agenteDoc.data());
        } else {
          console.error('Agente não encontrado!');
        }

        // Busca todas as microáreas
        const microareasSnapshot = await firestore().collection('microareas').get();
        const microareasList = microareasSnapshot.docs.map(doc => ({
          label: doc.data().Nome,
          value: doc.id,
          responsaveis: doc.data().responsaveis || [],
        }));

        // Verifica em qual microárea o agente está
        const microareaAssociada = microareasList.find(microarea =>
          microarea.responsaveis.includes(id)
        );

        if (microareaAssociada) {
          setMicroarea(microareaAssociada.label); // Define o nome da microárea associada ao agente
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchAgenteEMicroarea();
  }, [id]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Agentes de Saúde</Text>
      </View>

      {/* Exibição da microárea de atuação */}
      <Text style={styles.label}>Microárea de Atuação</Text>
      <View style={styles.microareaContainer}>
        <Text style={styles.microareaText}>
          {microarea ? microarea : 'Nenhuma microárea associada'}
        </Text>
      </View>

      {/* Exibição dos dados do agente */}
      {agente && (
        <View style={styles.infoContainer}>
          <Image source={require('../assets/icon-agente.png')} style={styles.agenteIcon} />
          <Text style={styles.nome}>{agente.nome}</Text>
          <Text style={styles.info}>
            Data de Nascimento: {agente.dataNascimento ?
              new Date(agente.dataNascimento._seconds * 1000).toLocaleDateString() :
              'Data não disponível'}
          </Text>
          <Text style={styles.info}>{agente.email}</Text>
        </View>
      )}

      {/* Mensagem informativa para alteração de microárea */}
      <View style={styles.infoMessageContainer}>
        <Text style={styles.infoMessageText}>
          Para alterar a microárea do agente, vá até a opção de microárea
        </Text>
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
  microareaContainer: {
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  microareaText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#000',
  },
  infoContainer: {
    alignItems: 'center',
  },
  agenteIcon: {
    width: 200,
    height: 200,
    marginBottom: 30,
    marginTop: 15,
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
    color: "#000000",
  },
  infoMessageContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  infoMessageText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#ff0000',
    textAlign: 'center',
  },
});

export default ViewAgenteScreen;
