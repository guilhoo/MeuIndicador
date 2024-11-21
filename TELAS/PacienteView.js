import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation, useRoute } from '@react-navigation/native';

// Função para formatar o indicador
const formatarIndicador = (indicador) => {
  const indicadores = {
    hiperdia: 'Hiperdia',
    crianca: 'Criança',
    gravida: 'Grávida',
    mulher: 'Mulher',
  };
  return indicadores[indicador] || indicador;
};

// Header simplificado
const Header = ({ onBack }) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
    </TouchableOpacity>
    <Text style={styles.title}>Paciente</Text>
  </View>
);

// Componente principal de visualização do paciente
const PacienteView = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [paciente, setPaciente] = useState(route.params.paciente);
  const [microarea, setMicroarea] = useState(paciente.microarea || null);
  const [microareas, setMicroareas] = useState([]);
  const [status, setStatus] = useState(paciente.especificos?.status || 'ATIVO');
  const [openMicroarea, setOpenMicroarea] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [statusItems] = useState([
    { label: 'ATIVO', value: 'ATIVO', icon: () => <Image source={require('../assets/bolinha-azul.png')} style={styles.IconStatus} /> },
    { label: 'INATIVO', value: 'INATIVO', icon: () => <Image source={require('../assets/bolinha-red.png')} style={styles.IconStatus} /> },
  ]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (paciente && paciente.especificos?.status) {
      setStatus(paciente.especificos.status);
    }
  }, [paciente]);

  // Função para buscar as informações do paciente e microárea associada
  useEffect(() => {
    const fetchPacienteEMicroarea = async () => {
      try {
        // Verifique se paciente.id está disponível
        if (!paciente || !paciente.id) {
          console.error('ID do paciente não disponível');
          return;
        }
  
        const pacienteDoc = await firestore().collection('pacientes').doc(paciente.id).get();
        if (pacienteDoc.exists) {
          setPaciente({ id: pacienteDoc.id, ...pacienteDoc.data() });
        } else {
          console.error('Paciente não encontrado!');
        }
  
        // Busca todas as microáreas
        const microareasSnapshot = await firestore().collection('microareas').get();
        const microareasList = microareasSnapshot.docs.map(doc => ({
          label: doc.data().Nome,
          value: doc.id,
          pacientes: doc.data().pacientes || [], // Certifique-se de que 'pacientes' seja um array
          icon: () => <Image source={require('../assets/icon-microarea.png')} style={styles.IconMicroarea} />, // Adiciona a referência ao ícone
        }));
  
        setMicroareas(microareasList);
  
        // Verifica em qual microárea o paciente está
        const microareaAssociada = microareasList.find(microarea =>
          microarea.pacientes.includes(paciente.id)
        );
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };
  
    fetchPacienteEMicroarea();
  }, [paciente]);

  const handleAcompanhamento = () => {
    switch (paciente.indicador) {
      case 'hiperdia':
        return 'HiperdiaScreen';
      case 'crianca':
        return 'CriancaScreen';
      case 'gravida':
        return 'AcompanhamentoGravida';
      case 'mulher':
        return 'MulherScreen';
      default:
        console.error('Indicador desconhecido');
        return null;
    }
  };

  // Atualiza o status e salva no Firestore
  const handleStatusChange = async (value) => {
    if (value) { // Verifica se o valor não é nulo ou indefinido
      setStatus(value);
      try {
        if (paciente && paciente.id) {
          await firestore().collection('pacientes').doc(paciente.id).update({
            'status': value,
          });
          console.log('Status \ com sucesso:', value);
        } else {
          console.error('ID do paciente não disponível para atualização');
        }
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
      }
    } else {
      console.error('Valor inválido para atualização de status:', value);
    }
  };

  return (
    <View style={styles.container}>
      <Header onBack={() => navigation.goBack()} />
      <View style={styles.patientInfoContainer}>
        <Image source={require('../assets/pregnant.png')} style={styles.pacienteIcon} />
        <Text style={styles.pacienteNome}>{paciente.nome}</Text>
        <Text style={styles.pacienteIndicador}>
          <Text style={styles.label}>Indicador: </Text>
          <Text style={styles.value}>{formatarIndicador(paciente.indicador)}</Text>
        </Text>

        {/* Dropdown de Microárea */}
        <View style={[styles.dropdownContainer, { zIndex: 2 }]}>
          <DropDownPicker
            open={openMicroarea}
            value={microarea}
            items={microareas}
            setOpen={setOpenMicroarea}
            setValue={setMicroarea}
            placeholder="Selecione Microárea"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropDownContainer}
            textStyle={styles.dropdownTextMicroarea}
          />
        </View>

        {/* Dropdown de Status */}
        <View style={[styles.dropdownContainer, { zIndex: 1 }]}>
        <DropDownPicker
          open={openStatus}
          value={status}
          items={statusItems}
          setOpen={setOpenStatus}
          setValue={(callback) => {
            const newValue = callback(status); // Chame a função de callback para obter o novo valor
            setStatus(newValue); // Atualize o estado com o novo valor
            handleStatusChange(newValue); // Chame a função com o novo valor
          }}
          placeholder="Selecione Status"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropDownContainer}
          textStyle={styles.dropdownTextStatus}
        />
        </View>
      </View>

      <View style={styles.rowContainer}>
        <TouchableOpacity
          style={[styles.optionContainer, status === 'INATIVO' && styles.disabledOption]}
          onPress={() => {
            if (status === 'INATIVO') {
              Alert.alert(
                "Usuário Inativo",
                "Para acessar, ative o usuário.",
                [{ text: "OK", onPress: () => console.log("Alerta fechado") }]
              );
            } else {
              const screenName = handleAcompanhamento();
              if (screenName) {
                navigation.navigate(screenName, { paciente });
              }
            }
          }}
        >
          <Image source={require('../assets/acompanhamento.png')} style={styles.optionIcon} />
          <Text style={styles.optionText}>Acompanhamento</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionContainer} onPress={() => navigation.navigate('DadosCadastrais', { paciente })}>
          <Image source={require('../assets/dados.png')} style={styles.optionIcon} />
          <Text style={styles.optionText}>Dados Cadastrais</Text>
        </TouchableOpacity>

      </View>

      <TouchableOpacity style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Excluir Paciente</Text>
      </TouchableOpacity>

    {/* Adiciona o CustomAlert aqui */}
    {modalVisible && (
      <CustomAlert
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    )}
  </View>
);}

// Estilos necessários para os componentes
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
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
    marginLeft: 10,
  },
  patientInfoContainer: {
    alignItems: 'center',
  },
  pacienteIcon: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  pacienteNome: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    color: '#000',
  },
  pacienteIndicador: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#000',
    marginBottom: 10,
    fontFamily: 'Montserrat-SemiBold',
  },
  value: {
    fontSize: 18,
    color: '#000',
    marginBottom: 20,
    fontFamily: 'Montserrat-Regular',
  },
  dropdownContainer: {
    width: '100%',
    marginBottom: 15,
    borderColor: '#0000AF',
  },
  dropdown: {
    borderColor: '#0000AF',
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 10,
  },
  dropdownTextMicroarea: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    paddingVertical: 8,
  },
  dropdownTextStaus: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    paddingVertical: 8,
  },
  IconStatus: {
    width: 10,
    height: 10,
    marginLeft: 5,
  },
  IconMicroarea: {
    width: 20, // ajuste o tamanho conforme necessário
    height: 20,
    marginLeft: 5, // opcional, para espaçamento
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 20,
  },
  optionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 130,
    height: 130,
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    marginHorizontal: 15,
    elevation: 3,
  },
  optionIcon: {
    width: 50, // Tamanho do ícone
    height: 50,
    marginTop: 15,
  },
  optionText: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: '#000',
    paddingTop: 20,
  },
  deleteButton: {
    backgroundColor: '#ff4d4d', // Vermelho claro para indicar exclusão
    paddingVertical: 8, // Altura fina do botão
    paddingHorizontal: 20, // Largura do botão
    borderRadius: 20, // Bordas arredondadas
    alignItems: 'center',
    marginTop: 10, // Espaçamento superior
  },
  deleteButtonText: {
    color: '#fff', // Texto branco
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  disabledOption: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 10,
    color: '#000',
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 20,
    color: '#000',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default PacienteView;