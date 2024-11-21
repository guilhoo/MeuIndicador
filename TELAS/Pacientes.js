import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Para navegação

const PacientesScreen = () => {
  const navigation = useNavigation(); // Navegação para voltar
  const [isFocused, setIsFocused] = useState(false); // Novo estado para controlar o foco
  const [searchText, setSearchText] = useState(''); // Estado para o texto da busca

  return (
    <View style={styles.container}>
         
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Pacientes</Text>
      </View>

      {/* Campo de busca */}
      {/* 
      <View style={styles.searchContainer}>
        <Image source={require('../assets/icon-search.png')} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar Paciente"
          placeholderTextColor="#fff"
          value={searchText}
          onChangeText={setSearchText}
          onFocus={() => setIsFocused(true)}  // Define como focado
          onBlur={() => setIsFocused(false)}  // Define como não focado
        />
      </View>
      */}

      <Text style={styles.subtitle}>Clique para ver as listas de pacientes{"\n"}ou cadastre um novo paciente</Text>

      {/* Ícones de Pacientes */}
      <View style={styles.optionsContainer}>
        <View style={styles.row}>
          {/* Ícone de Grávidas */}
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('gravidasList')} >
            <Image source={require('../assets/pregnant.png')} style={styles.icon} />
            <Text style={styles.label}>Grávidas</Text>
          </TouchableOpacity>

          {/* Ícone de Crianças */}
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('criancasList')}>
            <Image source={require('../assets/kids.png')} style={styles.icon} />
            <Text style={styles.label}>Crianças</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          {/* Ícone de Hiperdia */}
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('hiperdiaList')}>
            <Image source={require('../assets/hiperdia.png')} style={styles.icon} />
            <Text style={styles.label}>Hiperdia</Text>
          </TouchableOpacity>

          {/* Ícone de Mulheres */}
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('mulheresList')}>
            <Image source={require('../assets/women.png')} style={styles.icon} />
            <Text style={styles.label}>Mulheres</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.containerButton}>

      {/* Botão de Todos os Pacientes */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AllPacientesList')}>
        <Text style={styles.buttonText}>Todos os Pacientes</Text>
      </TouchableOpacity>

      {/* Botão de Cadastrar Paciente */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CadastroPacienteScreen')}>
        <Text style={styles.buttonText}>Cadastrar Paciente</Text>
      </TouchableOpacity>

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
