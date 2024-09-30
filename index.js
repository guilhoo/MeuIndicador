/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';  // Supondo que o App ainda esteja na raiz
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
