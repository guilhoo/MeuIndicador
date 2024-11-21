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
import Microareas from './TELAS/Microareas';
import CadastroMicroarea from './TELAS/CadastrarMicroarea';
import EditMicroarea from './TELAS/editMicroarea';
import Pacientes from './TELAS/Pacientes';
import CadastroPacienteScreen from './TELAS/cadastrarPaciente';
import AllPacientesList from './TELAS/AllPacientesList';
import gravidasList from './TELAS/gravidasList'
import criancasList from './TELAS/criancasList'
import mulheresList from './TELAS/mulheresList'
import hiperdiaList from './TELAS/hiperdiaList'
import PacienteView from './TELAS/PacienteView'
import AcompanhamentoGravida from './TELAS/AcompanhamentoGravida'
import DadosCadastraisScreen from './TELAS/dadosCadastrais';
import Conquista from './TELAS/ConquistaScreen'; 
import RoadMapScreen from './TELAS/RoadMapScreen';
import RankingScreen from './TELAS/RankingScreen';

if (!firebase.apps.length) {
  firebase.initializeApp();
}

const Stack = createNativeStackNavigator();

const App = () => {

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
          <Stack.Screen name="Microareas" component={Microareas} options={{ headerShown: false }} />
          <Stack.Screen name="CadastrarMicroareas" component={CadastroMicroarea} options={{ headerShown: false }} />
          <Stack.Screen name="editMicroareas" component={EditMicroarea} options={{ headerShown: false }} />
          <Stack.Screen name="Pacientes" component={Pacientes} options={{ headerShown: false }} />
          <Stack.Screen name="CadastroPacienteScreen" component={CadastroPacienteScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AllPacientesList" component={AllPacientesList} options={{ headerShown: false }} />
          <Stack.Screen name="gravidasList" component={gravidasList} options={{ headerShown: false }} />
          <Stack.Screen name="criancasList" component={criancasList} options={{ headerShown: false }} />
          <Stack.Screen name="hiperdiaList" component={hiperdiaList} options={{ headerShown: false }} />
          <Stack.Screen name="mulheresList" component={mulheresList} options={{ headerShown: false }} />
          <Stack.Screen name="PacienteView" component={PacienteView} options={{ headerShown: false }} />
          <Stack.Screen name="AcompanhamentoGravida" component={AcompanhamentoGravida} options={{ headerShown: false }} />
          <Stack.Screen name="DadosCadastrais" component={DadosCadastraisScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Conquista" component={Conquista} options={{ headerShown: false }} />
          <Stack.Screen name="RoadMap" component={RoadMapScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Ranking" component={RankingScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast /> 
    </>
  );
};

export default App;
