
import {NavigationContainer, DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme} from '@react-navigation/native';
import {Provider as PaperProvider, DefaultTheme as PaperDefaultTheme, DarkTheme as PaperDarkTheme} from 'react-native-paper';


export const darkTheme ={

    mode:"dark",
    primary: '#222',
    secondary: '#555',
    accent: '#8bf',
    tint: '#fff',
}

export const lightTheme ={

    mode:"light",
    primary: '#fff',
    secondary: '#bbb',
    accent: '#4af',
    tint: '#000',
}

export const CustomDefaultTheme = {
    ...NavigationDefaultTheme,
    ...PaperDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      ...PaperDefaultTheme.colors,
      background: '#ffffff',
      text: '#333333'
    }
  }
  
  
  export const CustomDarkTheme = {
    ...NavigationDarkTheme,
    ...PaperDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      ...PaperDarkTheme.colors,
      background: '#333333',
      text: '#ffffff'
    }
  }

// Light theme colors
export const lightColors = {
  background: '#FFFFFF',
  primary: '#512DA8',
  text: '#121212',
  error: '#D32F2F',
};

// Dark theme colors
export const darkColors = {
  background: '#121212',
  primary: '#B39DDB',
  text: '#FFFFFF',
  error: '#EF9A9A',
};