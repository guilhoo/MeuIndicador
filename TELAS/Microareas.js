import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore'; // Importa Firestore
import { useNavigation, useFocusEffect, useRoute  } from '@react-navigation/native'; // Para navegação

const Microareas = () => {
  const [microareas, setMicroareas] = useState([]);
  const [filteredMicroareas, setFilteredMicroareas] = useState([]); 
  const [loading, setLoading] = useState(true); // Estado para controlar o loading
  const navigation = useNavigation(); // Navegação para voltar
  const route = useRoute(); // Pega a rota

  const fetchMicroareas = async () => {
    try {
      const microareasSnapshot = await firestore()
        .collection('microareas')
        .get();

      if (microareasSnapshot.empty) {
        console.log("Nenhuma microárea de saúde encontrada!");
      } else {
        const microareasList = microareasSnapshot.docs.map(doc => ({
          id: doc.id,
          Nome: doc.data().Nome,
        }));

        microareasList.sort((a, b) => a.Nome.localeCompare(b.Nome));
        setMicroareas(microareasList);
        setFilteredMicroareas(microareasList);
      }
    } catch (error) {
      console.error('Erro ao buscar microáreas:', error);
    } finally {
      setLoading(false); // Desativa o loading após o carregamento dos dados
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true); // Ativa o loading ao voltar para a tela
      fetchMicroareas();
    }, [])
  );

  // Verifica se o parâmetro "updated" foi passado e recarrega os dados
  useEffect(() => {
    if (route.params?.updated) {
      setLoading(true); // Ativa o loading
      fetchMicroareas(); // Recarrega a lista
    }
  }, [route.params?.updated]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Carregando microáreas...</Text>
      </View>
    );
  }

  return (

    <View style={styles.container}>
      {/* Cabeçalho com ícone de voltar e nome da tela */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Microáreas</Text>
      </View>
        <View style={styles.listContainer}>

          {/* Texto informativo */}
          {filteredMicroareas.length > 0 && (
              <Text style={styles.infoText}>
                Clique em uma microárea{"\n"}para editar ou excluir
              </Text>
            )}

            <FlatList
                data={filteredMicroareas}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity  onPress={() => navigation.navigate('editMicroareas', { microareaId: item.id })}>
                    <View style={styles.microareaItem}>
                        <Text style={styles.microareaText}>{item.Nome}</Text>
                    </View>
                    </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={() => (
                  <View style={styles.emptyContainer}>
                    <Image
                      source={require('../assets/imagem-vazia.png')} // Atualize para o caminho correto da sua imagem
                      style={styles.emptyImage}
                    />
                    <Text style={styles.emptyText}>Ainda sem Microáreas{"\n"}Cadastradas...</Text>
                  </View>
                )}
                ListFooterComponent={() => (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => navigation.navigate('CadastrarMicroareas')}
                        >
                            <Text style={styles.buttonText}>Cadastrar nova{"\n"}Microárea</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff', // Fundo básico cinza claro
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom:20,
    },
    backButton: {
        marginRight: 75,
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
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 0,
    },
    emptyImage: {
      width: 250,
      height: 250,
      resizeMode: 'contain', // Garante que a imagem seja ajustada corretamente
    },
    emptyText: {
      marginTop: 20,
      fontFamily: 'Montserrat-SemiBold',
      fontSize: 20,
      color: '#000000',
      textAlign: 'center',
      marginBottom: 50,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
    },
    loadingText: {
      marginTop: 20,
      fontSize: 16,
      fontFamily: 'Montserrat-SemiBold',
      color: '#000000',
      textAlign: 'center',
    },
    infoText: {
        fontSize: 16,
        fontFamily: 'Montserrat-Regular',
        color: '#666', // Cinza para um contraste suave
        marginBottom: 60, // Espaçamento entre o texto e a lista
        textAlign: 'center', // Centralizar o texto
    },
    listContainer: {
        flex: 1,
        marginTop: 20,
        backgroundColor: 'transparent',
    },
    microareaItem: {
        padding: 15,
        backgroundColor: '#0000AF', // Cor clara para o item (azul claro)
        borderRadius: 5,
        marginBottom: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    microareaText: {
        alignSelf: "center",
        fontSize: 18,
        fontFamily: 'Montserrat-SemiBold',
        color: '#fff',
    },
    separator: {
        height: 1,
        backgroundColor: '#ccc',
    },
    buttonContainer: {
        marginTop: 40,
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#0000AF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignContent: "center",
    },
    buttonText: {
        fontSize: 18,
        fontFamily: 'Montserrat-Bold',
        color: '#FFFFFF',
        textAlign:"center",
    },
});

export default Microareas;
