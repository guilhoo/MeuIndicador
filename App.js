import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import firebase from '@react-native-firebase/app';
import Toast from 'react-native-toast-message';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { navigationRef } from './TELAS/RootNavigation'; // 🔶 Precisaremos configurar uma referência global para o navigation

import SplashScreen from './TELAS/SplashScreen';
import LoginScreen from './TELAS/LoginScreen';
import HomeEnfermeiro from './TELAS/HomeEnfermeiro';
import HomeAgenteSaude from './TELAS/HomeAgenteSaude';
import CadastroScreen from './TELAS/CadastroScreen'; 
import PasswordReset from './TELAS/PasswordReset';
import Agentes from './TELAS/Agentes'
import ViewAgente from './TELAS/ViewAgente'

if (!firebase.apps.length) {
  firebase.initializeApp();
}

const Stack = createNativeStackNavigator();

const App = () => {
  
  // Função de handling para o Dynamic Link
  const handleDynamicLink = (link) => {
    if (link) {
      console.log('Dynamic link capturado:', link.url); // Verifica se o link foi capturado
      // 🔶 Removido o redirecionamento para a tela de Redefinir Senha
    } else {
      console.log('Nenhum dynamic link capturado');
    }
  };

  // useEffect dentro do componente App
  useEffect(() => {
    // Captura link inicial (quando o app abre via link)
    dynamicLinks().getInitialLink()
      .then((link) => {
        if (link) {
          console.log('Link inicial capturado:', link.url);
          handleDynamicLink(link);
        } else {
          console.log('Nenhum link inicial capturado');
        }
      })
      .catch((error) => {
        console.error('Erro ao capturar link inicial:', error);
      });
  
    // Listener para links enquanto o app está aberto
    const unsubscribe = dynamicLinks().onLink(handleDynamicLink);
  
    // Limpa o listener ao desmontar o componente
    return () => unsubscribe();
  }, []);

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ headerShown: false }} />
          <Stack.Screen name="HomeEnfermeiro" component={HomeEnfermeiro} options={{ headerShown: false }} />
          <Stack.Screen name="HomeAgenteSaude" component={HomeAgenteSaude} options={{ headerShown: false }} />
          <Stack.Screen name="PasswordReset" component={PasswordReset} options={{ headerShown: false }} />
          <Stack.Screen name="Agentes" component={Agentes} options={{ headerShown: false }} />
          <Stack.Screen name="ViewAgente" component={ViewAgente} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast /> 
    </>
  );
};

export default App;
