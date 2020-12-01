import React, { useEffect, useState } from "react";
import {
  Body,
  Button,
  Card,
  CardItem,
  Container,
  Content,
  Text,
} from "native-base";
import firebase from "../helpers/Firebase";
import { useTheme } from "../helpers/ThemeContext";
import { DarkModeToggle } from "../helpers/Switch";

const SettingsScreen = (props) => {
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const { colors, isDark } = useTheme();

  const containerStyle = {
    backgroundColor: colors.background,
  };

  const textStyle = {
    color: colors.text,
  };

  useEffect(() => {
    setName(firebase.auth().currentUser.displayName);
    setEmail(firebase.auth().currentUser.email);
  }, []);

  return (
    <Container style={containerStyle}>
      <Content>
        <Card>
          <CardItem header>
            <Text>User infromation</Text>
          </CardItem>
          <CardItem>
            <Body>
              <Text>
                Name: {name}
                {"\n"}
                Email: {email}
                {"\n"}
              </Text>
            </Body>
          </CardItem>
          <CardItem style={{ justifyContent: "center" }}>
            <Button
              warning
              transparent
              onPress={() => props.navigation.navigate("Modify")}
            >
              <Text>Update information</Text>
            </Button>
            <Button
              danger
              transparent
              onPress={() => firebase.auth().signOut()}
            >
              <Text>Logout</Text>
            </Button>
          </CardItem>
        </Card>
        <Text style={textStyle}>Toggle Darkmode</Text>
        <DarkModeToggle></DarkModeToggle>
      </Content>
    </Container>
  );
};

export default SettingsScreen;
