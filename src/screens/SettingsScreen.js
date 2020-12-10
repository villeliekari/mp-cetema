import React, { useState, useContext } from "react";
import {
  Body,
  Button,
  Card,
  CardItem,
  Container,
  Content,
  Form,
  Input,
  Item,
  Label,
  Text,
  View,
} from "native-base";
import firebase from "../helpers/Firebase";
import { useFocusEffect, useTheme } from "@react-navigation/native";
import { Switch, TouchableRipple } from "react-native-paper";
import ThemeContext from "../helpers/ThemeContext";
import asyncStorage from "../helpers/AsyncStorage";

const SettingsScreen = (props) => {
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [boatName, setBoatName] = useState(null);
  const [boatType, setBoatType] = useState(null);
  const [radius, setRadius] = useState(null);
  const [updateInterval, setUpdateInterval] = useState(null);
  const [fetchTime, setFetchtime] = useState(null);
  const { colors } = useTheme();

  const containerStyle = {
    backgroundColor: colors.background,
  };

  const textStyle = {
    color: colors.text,
  };

  const { isDarkTheme, toggleTheme } = useContext(ThemeContext);

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

    const getSavedFromAsyncStorage = async () => {
      setRadius(await asyncStorage.get("@fetchRadius"));
      setUpdateInterval(await asyncStorage.get("@fetchInterval"));
      setFetchtime(await asyncStorage.get("@fetchTime"));
    };

    getSavedFromAsyncStorage();
    getBoatInfo();
  }, []);

  return (
    <Container style={containerStyle}>
      <Content>
        <Card>
          <CardItem
            header
            bordered
            style={{ backgroundColor: colors.background }}
          >
            <Text style={{ color: colors.text }}>My infromation</Text>
          </CardItem>
          <CardItem style={{ backgroundColor: colors.background }}>
            <Body>
              <Text style={{ color: colors.text }}>
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
          <CardItem
            style={{
              justifyContent: "center",
              backgroundColor: colors.background,
            }}
          >
            <Button
              info
              transparent
              onPress={() => props.navigation.navigate("Update Information")}
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
          <CardItem
            header
            bordered
            style={{ backgroundColor: colors.background }}
          >
            <Text style={{ color: colors.text }}>App settings</Text>
          </CardItem>
          <CardItem style={{ backgroundColor: colors.background }}>
            <TouchableRipple>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: colors.text, paddingTop: 2, paddingRight: "3%" }}>Toggle Dark Theme</Text>
                <Switch
                  value={isDarkTheme === true}
                  onValueChange={toggleTheme}
                />
              </View>
            </TouchableRipple>
          </CardItem>
          <Form style={{ backgroundColor: colors.background }}>
            <Item stackedLabel>
              <Label style={{ color: colors.text }}>
                Fetch radius (kilometers) Default is 100.
              </Label>
              <Input
                style={{ color: colors.text }}
                placeholder="Custom radius for AIS ships."
                value={radius}
                keyboardType="numeric"
                onChangeText={(val) => {
                  setRadius(val);
                  asyncStorage.set("@fetchRadius", val);
                }}
              />
            </Item>
            <Item stackedLabel>
              <Label style={{ color: colors.text }}>
                Fetch AIS ship information age newer than (minutes) Default is
                30.
              </Label>
              <Input
                style={{ color: colors.text }}
                placeholder="Custom time for max age of AIS information"
                value={fetchTime}
                keyboardType="numeric"
                onChangeText={(val) => {
                  setFetchtime(val);
                  asyncStorage.set("@fetchTime", val);
                }}
              />
            </Item>
            <Item stackedLabel>
              <Label style={{ color: colors.text }}>
                Fetch AIS ships interval (minutes) Default is 2. Requires
                restart.
              </Label>
              <Input
                style={{ color: colors.text }}
                placeholder="Custom interval to update AIS ships."
                value={updateInterval}
                keyboardType="numeric"
                onChangeText={(val) => {
                  setUpdateInterval(val);
                  asyncStorage.set("@fetchInterval", val);
                }}
              />
            </Item>
          </Form>
        </Card>
        <Button
          info
          transparent
          block
          onPress={() => props.navigation.navigate("About")}
        >
          <Text>About</Text>
        </Button>
      </Content>
    </Container>
  );
};

export default SettingsScreen;
