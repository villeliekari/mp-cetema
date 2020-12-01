import * as React from 'react';
import {Switch as RNSwitch} from 'react-native';
import {useTheme} from '../helpers/ThemeContext';

export const DarkModeToggle = () => {
    // We're also pulling setScheme here!
    const {setScheme, isDark} = useTheme();

    const toggleScheme = () => {
        /*
        * setScheme will change the state of the context
        * thus will cause childrens inside the context provider to re-render
        * with the new color scheme
        */
        isDark ? setScheme('light') : setScheme('dark');
    }

    return (
        <RNSwitch value={isDark} onValueChange={toggleScheme}/>
    );
}