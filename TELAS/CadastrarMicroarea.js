import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation, useFocusEffect  } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';

const CadastroMicroarea = () => {
  const [agentes, setAgentes] = useState([]);
  const [open, setOpen] = useState(false); // Para abrir o dropdown
  const [selectedAgentes, setSelectedAgentes] = useState([]); // Agentes selecionados
  const [nomeMicroarea, setNomeMicroarea] = useState(''); // Nome da microárea
  const navigation = useNavigation();

  useEffect(() => {
    const fetchAgentes = async () => {
      try {
        // Busca todas as microáreas e seus agentes
        const microareasSnapshot = await firestore().collection('microareas').get();
        const agentesCadastrados = new Set();
        
        // Para cada microárea, adicionar os agentes cadastrados a um Set (para garantir que não há duplicatas)
        microareasSnapshot.forEach(doc => {
          const responsaveis = doc.data().responsaveis || [];
          responsaveis.forEach(agente => agentesCadastrados.add(agente));
        });
  
        // Busca todos os agentes de saúde
        const snapshot = await firestore()
          .collection('users')
          .where('role', '==', 'Agente de Saúde')
          .get();
  
        // Filtra os agentes que já estão em alguma microárea
        const agentesList = snapshot.docs
          .map(doc => ({
            label: doc.data().nome, // Nome do agente
            value: doc.id,          // ID do agente
          }))
          .filter(agente => !agentesCadastrados.has(agente.value)) // Remove agentes já cadastrados
          .sort((a, b) => a.label.localeCompare(b.label)); // Ordena por nome (label)
  
        setAgentes(agentesList);
      } catch (error) {
        console.error('Erro ao buscar agentes de saúde: ', error);
      }
    };
  
    fetchAgentes();
  }, []);

  const salvarMicroarea = async () => {
    if (nomeMicroarea.trim() === '' || selectedAgentes.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Preencha todos os campos para cadastrar Microárea.',
      });
      return;
    }
  
    try {
      // Adiciona uma nova microárea na collection 'microareas'
      await firestore().collection('microareas').add({
        Nome: nomeMicroarea, // Nome da microárea
        responsaveis: selectedAgentes, // Lista de IDs dos agentes (array)
      });
  
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Microárea cadastrada com sucesso!',
      });
      
      setNomeMicroarea(''); // Limpa o campo de nome
      setSelectedAgentes([]); // Limpa a seleção de agentes

      setTimeout(() => {
        navigation.goBack(); // Volta para a tela de Home
    }, 1000); 

    } catch (error) {
      console.error('Erro ao salvar microárea: ', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Erro ao cadastrar microárea. Tente novamente.',
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
        <Text style={styles.title}>Cadastrar Microárea</Text>
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
          <TextInput style={styles.inputNome}
            value={nomeMicroarea} // Adiciona o valor controlado aqui
            onChangeText={text => setNomeMicroarea(text)} // Atualiza a variável nomeMicroarea
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
          multiple={true} // Permite seleção múltipla
          mode="BADGE"
          placeholder="Selecionar Agente(S)"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropDownContainer}
          listMode="SCROLLVIEW"
          scrollViewProps={{ nestedScrollEnabled: true }} // Habilita a rolagem
          textStyle={styles.dropdownText} // Estilo da fonte aplicada nos itens
          maxHeight={200} // Limite a altura do dropdown
          selectedItemContainerStyle={{
            backgroundColor: "#efefef"
          }}
          badgeTextStyle ={{
            color: "#0000AF"
          }}
        />
      </View>

      {/* Botão de Cadastrar */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={salvarMicroarea}>
          <Text style={styles.buttonText}>Cadastrar nova{"\n"}Microárea</Text>
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
  buttonContainer: {
    marginTop: 40,
    alignItems: 'center',
    marginBottom: 50,
  },
  button: {
    backgroundColor: '#0000AF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default CadastroMicroarea;
