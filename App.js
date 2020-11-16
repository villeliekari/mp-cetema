import * as React from 'react';
import { StatusBar } from 'react-native';
import Navigation from './src/Navigator';
import { colors } from './src/GlobalVariables';


const App = () => {
  return (
    <>
      <StatusBar
        backgroundColor={colors.darkPrimary}
      />
      <Navigation />
    </>
  );
}

export default App;
