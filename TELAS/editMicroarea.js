import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';
import { Alert } from 'react-native';

const EditMicroarea = () => {
  const [agentes, setAgentes] = useState([]);
  const [open, setOpen] = useState(false); 
  const [selectedAgentes, setSelectedAgentes] = useState([]); 
  const [nomeMicroarea, setNomeMicroarea] = useState(''); 
  const navigation = useNavigation();
  const route = useRoute();
  const { microareaId } = route.params; // Pega o ID da microárea passada na navegação

  useEffect(() => {
    const fetchMicroarea = async () => {
      try {
        // Busca as informações da microárea pelo ID
        const microareaDoc = await firestore().collection('microareas').doc(microareaId).get();
        const microareaData = microareaDoc.data();
  
        setNomeMicroarea(microareaData.Nome);
        setSelectedAgentes(microareaData.responsaveis || []);
  
        // Busca todas as microáreas e seus agentes
        const microareasSnapshot = await firestore().collection('microareas').get();
        const agentesCadastrados = new Set();
  
        // Para cada microárea, adicionar os agentes cadastrados a um Set (para garantir que não há duplicatas)
        microareasSnapshot.forEach(doc => {
          const responsaveis = doc.data().responsaveis || [];
          // Só adiciona os agentes de outras microáreas (não a que está sendo editada)
          if (doc.id !== microareaId) {
            responsaveis.forEach(agente => agentesCadastrados.add(agente));
          }
        });
  
        // Busca todos os agentes de saúde
        const snapshot = await firestore()
          .collection('users')
          .where('role', '==', 'Agente de Saúde')
          .get();
  
        // Filtra os agentes que já estão em outra microárea, exceto os que já estão na microárea sendo editada
        const agentesList = snapshot.docs
          .map(doc => ({
            label: doc.data().nome,
            value: doc.id,
          }))
          .filter(agente => !agentesCadastrados.has(agente.value) || selectedAgentes.includes(agente.value))
          .sort((a, b) => a.label.localeCompare(b.label)); // Ordena os agentes alfabeticamente
  
        setAgentes(agentesList);
      } catch (error) {
        console.error('Erro ao buscar microárea:', error);
      }
    };
  
    fetchMicroarea();
  }, [microareaId]);

  const salvarMicroarea = async () => {
    if (nomeMicroarea.trim() === '' || selectedAgentes.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Preencha todos os campos para editar Microárea.',
      });
      return;
    }

    try {
      // Atualiza a microárea existente
      await firestore().collection('microareas').doc(microareaId).update({
        Nome: nomeMicroarea,
        responsaveis: selectedAgentes,
      });

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Microárea atualizada com sucesso!',
      });
      setTimeout(() => {
        navigation.goBack(); // Volta para a tela anterior após salvar
      }, 1000); 
    } catch (error) {
      console.error('Erro ao salvar microárea:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Erro ao atualizar microárea. Tente novamente.',
      });
    }
  };

  const excluirMicroarea = async () => {
    try {
      // Verifica se há pacientes associados à microárea
      const pacientesSnapshot = await firestore()
        .collection('pacientes')
        .where('microarea', '==', microareaId)
        .get();
  
      if (!pacientesSnapshot.empty) {
        // Se houver pacientes associados, impede a exclusão e exibe um alerta
        Alert.alert(
          "Microárea Associada",
          "Não é possível excluir esta microárea, pois há pacientes associados.",
          [{ text: "OK" }]
        );
        return;
      }
  
      // Se não houver pacientes associados, pergunta para confirmar a exclusão
      Alert.alert(
        "Confirmação",
        "Tem certeza que deseja excluir esta microárea?",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Excluir",
            onPress: async () => {
              try {
                await firestore().collection('microareas').doc(microareaId).delete();
  
                Toast.show({
                  type: 'success',
                  text1: 'Sucesso',
                  text2: 'Microárea excluída com sucesso!',
                });
  
                // Volta para a tela de lista de microáreas
                setTimeout(() => {
                  navigation.goBack();
                }, 1000);
              } catch (error) {
                console.error('Erro ao excluir microárea:', error);
                Toast.show({
                  type: 'error',
                  text1: 'Erro',
                  text2: 'Erro ao excluir microárea. Tente novamente.',
                });
              }
            }
          }
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Erro ao verificar pacientes associados:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Erro ao verificar pacientes associados. Tente novamente.',
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Microárea</Text>
      </View>

      {/* Icon Cadastrar Microárea */}
      <View style={styles.iconContainerImage}>
        <Image 
          source={require('../assets/microarea-icon.png')}
          style={styles.microareaIcon}
        />
      </View>

      {/* Campo Nome da Microárea */}
      <View style={styles.inputNomeContainer}>
        <Text style={styles.inputLabel}>Nome da Microárea</Text>
        <View style={styles.inputField}>
          <TextInput 
            style={styles.inputNome}
            value={nomeMicroarea} 
            onChangeText={text => setNomeMicroarea(text)} 
          />
        </View>
      </View>

      {/* Campo Agentes de Saúde (Dropdown Picker) */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.inputLabel}>Agente(s) de Saúde</Text>
        <DropDownPicker
          open={open}
          value={selectedAgentes}
          items={agentes}
          setOpen={setOpen}
          setValue={setSelectedAgentes}
          setItems={setAgentes}
          multiple={true} 
          mode="BADGE"
          placeholder="Selecionar Agente(S)"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropDownContainer}
          listMode="SCROLLVIEW"
          scrollViewProps={{ nestedScrollEnabled: true }} 
          textStyle={styles.dropdownText} 
          maxHeight={200} 
          selectedItemContainerStyle={{
            backgroundColor: "#efefef"
          }}
          badgeTextStyle ={{
            color: "#0000AF"
          }}
        />
      </View>

      {/* Botões de Editar e Excluir */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.deleteButton} onPress={excluirMicroarea}>
          <Text style={styles.buttonText}>Excluir{"\n"}Microárea</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.editButton} onPress={salvarMicroarea}>
          <Text style={styles.buttonText}>Editar{"\n"}Microárea</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  backButton: {
    marginLeft: 15,
    marginRight: 25,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    color: '#000000',
  },
  iconContainerImage: {
    alignItems: 'center',
  },
  microareaIcon: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
  inputNomeContainer: {
    width: '90%',
    marginLeft: 15,
  },
  inputLabel: {
    color: '#000000',
    fontFamily: 'Montserrat-Regular',
    fontSize: 20,
    marginBottom: 5,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 25,
    borderColor: '#2222E7',
    paddingHorizontal: 10,
    height: 40,
  },
  inputNome: {
    flex: 1,
    height: '100%',
    color: '#000',
    fontFamily: 'Montserrat-Regular',
  },
  dropdownContainer: {
    width: '90%',
    marginLeft: 15,
    marginTop: 20,
  },
  dropdown: {
    borderColor: '#2222E7',
    borderWidth: 1,
    borderRadius: 25,
  },
  dropDownContainer: {
    borderColor: '#2222E7',
  },
  dropdownText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#AF0000',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignContent: 'center',
  },
  editButton: {
    backgroundColor: '#0000AF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default EditMicroarea;
