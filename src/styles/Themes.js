
import {DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme} from '@react-navigation/native';


// Light theme colors
export const lightColors = {
  background: '#FFFFFF',
  secondary: '#3282b8',
  text: '#121212',
  error: '#D32F2F',
  primary: '#2dafff',
  accent: '#3282b8',
  tint: '#000',
};

// Dark theme colors
export const darkColors = {
  background: '#121212',
  secondary: '#1b262c',
  text: '#FFFFFF',
  error: '#EF9A9A',
  primary: '#0f4c75',
  accent: '#1b262c',
  tint: '#fff',
};


export const CustomDefaultTheme = {
    ...NavigationDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      primary: '#000',
      background: '#fff',
      text: '#333',
      //card: '',
      //border: '',
      //notification: '',
    }
  }

  export const CustomDarkTheme = {
    ...NavigationDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      primary: '#fff',
      background: '#333',
      text: '#fff',
      //card: '',
      //border: '',
      //notification: '',
    }
  }
