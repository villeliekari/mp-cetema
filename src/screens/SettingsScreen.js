import React from "react";
import {Body, Button, Container, Content, Text} from "native-base";
import fb from "../helpers/Firebase";
import {useTheme} from '../helpers/ThemeContext';
import {DarkModeToggle} from '../helpers/Switch';

const SettingsScreen = () => {

  const {colors, isDark} = useTheme();

  const containerStyle = {
    backgroundColor: colors.background
  };

  const textStyle = {
    color: colors.text
  }

  return (
    <Container style={containerStyle}>
      <Content>
        <Body>
          <Text style={textStyle}>Settings screen</Text>
          <Text style={textStyle}>Firebase uid: {fb
              .auth()
              .currentUser
              .uid}</Text>
          <Text style={textStyle}>Firebase displayName: {fb
              .auth()
              .currentUser
              .displayName}</Text>
          <Text style={textStyle}>Firebase email: {fb
              .auth()
              .currentUser
              .email}</Text>
          <Button onPress={() => fb.auth().signOut()}
          backgroundColor={colors.primary}>
            <Text>Logout</Text>
          </Button>
          <Text style={textStyle}>Toggle Darkmode</Text>
          <DarkModeToggle></DarkModeToggle>
        </Body>
      </Content>
    </Container>
  );
};

export default SettingsScreen;
