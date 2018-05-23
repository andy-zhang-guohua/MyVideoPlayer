import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('MyVideoApp', () => App);

// 去除调试环境下反复出现的警告框，小心，可能错过一些重要信息
console.disableYellowBox = true;