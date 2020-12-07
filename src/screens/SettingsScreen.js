import React, { useState, useContext } from "react";
import {
  Body,
  Button,
  Card,
  CardItem,
  Container,
  Content,
  Text,
  View
} from "native-base";
import firebase from "../helpers/Firebase";
import { useFocusEffect, useTheme } from "@react-navigation/native";
import { Switch, TouchableRipple } from 'react-native-paper';
import ThemeContext from '../helpers/ThemeContext';

const SettingsScreen = (props) => {
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [boatName, setBoatName] = useState(null);
  const [boatType, setBoatType] = useState(null);

  const { colors } = useTheme();

  const containerStyle = {
    backgroundColor: colors.background,
  };

  const textStyle = {
    color: colors.text,
  };

  const { isDarkTheme, toggleTheme } = useContext(ThemeContext)

  useFocusEffect(() => {
    setName(firebase.auth().currentUser.displayName);
    setEmail(firebase.auth().currentUser.email);

    const getBoatInfo = async () => {
      await firebase
        .firestore()
        .collection("userBoats")
        .doc(firebase.auth().currentUser.uid)
        .get()
        .then((res) => {
          setBoatName(res.data().boatName);
          setBoatType(res.data().boatType);
        })
        .catch((err) => {
          console.log(err.message);
        });
    };
    getBoatInfo();
  }, []);

  return (
    <Container style={containerStyle}>
      <Content>
        <Card>
          <CardItem header bordered style={containerStyle}>
            <Text style={textStyle}>User infromation WIP</Text>
          </CardItem>
          <CardItem style={containerStyle}>
            <Body>
              <Text style={textStyle}>
                Name: {name}
                {"\n"}
                Email: {email}
                {"\n"}
                Boat name: {boatName}
                {"\n"}
                Boat type: {boatType}
                {"\n"}
              </Text>
            </Body>
          </CardItem>
          <CardItem style={{ justifyContent: "center", backgroundColor: colors.background }}>
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
        <Card>
          <CardItem header bordered>
            <Text>App settings</Text>
          </CardItem>
          <CardItem>
            <TouchableRipple>
              <View>
                <Text>Toggle Dark Theme</Text>
                <Switch value={isDarkTheme === true} onValueChange={toggleTheme} />
              </View>
            </TouchableRipple>
          </CardItem>
        </Card>
      </Content>
    </Container>
  );
};

export default SettingsScreen;
