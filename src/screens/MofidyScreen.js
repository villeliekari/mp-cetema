import React, { useEffect, useState } from "react";
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
} from "native-base";
import firebase from "../helpers/Firebase";
import { Alert } from "react-native";
import { useTheme } from "../helpers/ThemeContext";

const ModifyScreen = (props) => {
  const [currentPassword, setCurrentPassword] = useState(null);
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [boatName, setBoatName] = useState(null);
  const [boatType, setBoatType] = useState(null);

  const { colors, isDark } = useTheme();

  const containerStyle = {
    backgroundColor: colors.background,
  };

  const textStyle = {
    color: colors.text,
  };

  const updateUserInfo = async () => {
    if (
      firebase.auth().currentUser.displayName !== name ||
      firebase.auth().currentUser.email !== email
    ) {
      if (currentPassword) {
        try {
          await firebase
            .auth()
            .signInWithEmailAndPassword(
              firebase.auth().currentUser.email,
              currentPassword
            )
            .catch((err) => {
              throw new Error(err);
            });

          if (firebase.auth().currentUser.displayName !== name) {
            await firebase
              .auth()
              .currentUser.updateProfile({ displayName: name })
              .catch((err) => {
                throw new Error(err);
              });
          }

          if (firebase.auth().currentUser.email !== email) {
            await firebase
              .auth()
              .currentUser.updateEmail(email)
              .catch((err) => {
                throw new Error(err);
              });
          }

          Alert.alert("Information updated");
          props.navigation.navigate("Settings");
        } catch (err) {
          Alert.alert(err.message);
        }
      } else Alert.alert("Give current password");
    } else Alert.alert("Nothing to update");
  };

  const updateUserPassword = async () => {
    if (currentPassword && password && confirmPassword) {
      try {
        await firebase
          .auth()
          .signInWithEmailAndPassword(
            firebase.auth().currentUser.email,
            currentPassword
          )
          .catch((err) => {
            throw new Error(err);
          });

        if (password === confirmPassword) {
          await firebase
            .auth()
            .currentUser.updatePassword(password)
            .catch((err) => {
              throw new Error(err);
            });
        } else throw new Error("Passwords did not match");

        Alert.alert("Password updated!");
        props.navigation.navigate("Settings");
      } catch (err) {
        Alert.alert(err.message);
      }
    } else Alert.alert("Fill all fields");
  };

  const updateBoatInfo = async () => {
    if (boatName && boatType && currentPassword) {
      try {
        await firebase
          .auth()
          .signInWithEmailAndPassword(
            firebase.auth().currentUser.email,
            currentPassword
          )
          .catch((err) => {
            throw new Error(err);
          });

        await firebase
          .firestore()
          .collection("userBoats")
          .doc(firebase.auth().currentUser.uid)
          .update({
            boatName: boatName,
            boatType: boatType,
          })
          .catch((err) => {
            throw new Error(err);
          });

        Alert.alert("Boat information updated!");
        props.navigation.navigate("Settings");
      } catch (err) {
        Alert.alert(err.message);
      }
    } else Alert.alert("Fill all fields");
  };

  useEffect(() => {
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
          <CardItem header>
            <Text>Change user infromation</Text>
          </CardItem>
          <Form>
            <Item stackedLabel>
              <Label>Name</Label>
              <Input value={name} onChangeText={(val) => setName(val)} />
            </Item>
            <Item stackedLabel>
              <Label>Email</Label>
              <Input
                autoCapitalize="none"
                value={email}
                onChangeText={(val) => setEmail(val)}
              />
            </Item>
            <Item stackedLabel>
              <Label>Current Password</Label>
              <Input
                secureTextEntry
                onChangeText={(val) => setCurrentPassword(val)}
              />
            </Item>
            <Button
              transparent
              style={{ alignSelf: "center", margin: 10 }}
              onPress={updateUserInfo}
            >
              <Text>Update information</Text>
            </Button>
          </Form>
        </Card>

        <Card>
          <CardItem header>
            <Text>Change Password</Text>
          </CardItem>
          <Form>
            <Item stackedLabel>
              <Label>Current Password</Label>
              <Input
                secureTextEntry
                onChangeText={(val) => setCurrentPassword(val)}
              />
            </Item>
            <Item stackedLabel>
              <Label>New Password</Label>
              <Input
                secureTextEntry
                value={password}
                onChangeText={(val) => setPassword(val)}
              />
            </Item>
            <Item stackedLabel>
              <Label>Confirm new password</Label>
              <Input
                secureTextEntry
                value={confirmPassword}
                onChangeText={(val) => setConfirmPassword(val)}
              />
            </Item>
            <Button
              transparent
              style={{ alignSelf: "center", margin: 10 }}
              onPress={updateUserPassword}
            >
              <Text>Update password</Text>
            </Button>
          </Form>
        </Card>

        <Card>
          <CardItem header>
            <Text>Change boat infromation</Text>
          </CardItem>
          <Form>
            <Item stackedLabel>
              <Label>Boat name</Label>
              <Input
                value={boatName}
                onChangeText={(val) => setBoatName(val)}
              />
            </Item>
            <Item stackedLabel>
              <Label>Boat type</Label>
              <Input
                value={boatType}
                onChangeText={(val) => setBoatType(val)}
              />
            </Item>
            <Item stackedLabel>
              <Label>Current Password</Label>
              <Input
                secureTextEntry
                onChangeText={(val) => setCurrentPassword(val)}
              />
            </Item>
            <Button
              transparent
              style={{ alignSelf: "center", margin: 10 }}
              onPress={updateBoatInfo}
            >
              <Text>Update boat information</Text>
            </Button>
          </Form>
        </Card>
      </Content>
    </Container>
  );
};

export default ModifyScreen;
