
import {DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme} from '@react-navigation/native';
import {DefaultTheme as PaperDefaultTheme, DarkTheme as PaperDarkTheme} from 'react-native-paper';


export const CustomDefaultTheme = {
    ...NavigationDefaultTheme,
    ...PaperDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      ...PaperDefaultTheme.colors,
      background: '#ffffff',
      text: '#333333',
      accent: '#4af',
      secondary: '#bbb',
      tint: '#000',
    }
  }

  export const CustomDarkTheme = {
    ...NavigationDarkTheme,
    ...PaperDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      ...PaperDarkTheme.colors,
      background: '#333333',
      text: '#ffffff', 
      accent: '#8bf',
      secondary: '#555',
      tint: '#fff',
    }
  }
