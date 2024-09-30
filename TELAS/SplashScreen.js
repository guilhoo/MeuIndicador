import React from 'react';
import { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Define um temporizador de 2.5 segundos para trocar de tela
    const timer = setTimeout(() => {
      navigation.replace('Login'); // Substitua 'LoginScreen' pelo nome exato da sua tela de login
    }, 2500);

    // Limpa o temporizador se o componente for desmontado antes do tempo acabar
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logoBranca.png')} style={styles.image} />
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.boldText}>Meu</Text>
        <Text style={styles.mediumText}> Indicador</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0000FF',
  },
  image: {
    width: 200,  // Diminuído de 300 para 250
    height: 200, // Diminuído de 300 para 250
    resizeMode: 'contain'
  },
  boldText: {
    fontSize: 30,
    color: '#FFFFFF', // Ajuste a cor conforme necessário
    fontFamily: 'Montserrat-Bold', // Certifique-se de que a fonte está corretamente integrada
  },
  mediumText: {
    fontSize: 30,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Medium', // Certifique-se de que a fonte está corretamente integrada
  },
});

export default SplashScreen;
