import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import firebase from '@react-native-firebase/app';
import Toast from 'react-native-toast-message';

import SplashScreen from './TELAS/SplashScreen';
import LoginScreen from './TELAS/LoginScreen';
import HomeEnfermeiro from './TELAS/HomeEnfermeiro';
import HomeAgenteSaude from './TELAS/HomeAgenteSaude';
import CadastroScreen from './TELAS/CadastroScreen'; 

if (!firebase.apps.length) {
  firebase.initializeApp();
}

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ headerShown: false }} />
          <Stack.Screen name="HomeEnfermeiro" component={HomeEnfermeiro} />
          <Stack.Screen name="HomeAgenteSaude" component={HomeAgenteSaude} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast /> 
    </>
  );
};

export default App;
