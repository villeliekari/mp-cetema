/* @flow */

import * as React from 'react';

import {Text as TextRN} from 'native-base';
import {useTheme} from '../helpers/ThemeContext';

export const MyText = (props) => {

    const {colors, isDark} = useTheme();

    const textStyle = {
        color: colors.text
    };

    return (
        <TextRN style={textStyle}>{props.children}</TextRN>
    )

}