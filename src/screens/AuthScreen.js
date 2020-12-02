import React, { useEffect, useState } from "react";
import {
  Body,
  Button,
  Card,
  Container,
  Content,
  Form,
  Input,
  Item,
  Label,
  Text,
} from "native-base";
import { Alert } from "react-native";
import firebase from "../helpers/Firebase";
import asyncStorage from "../helpers/AsyncStorage";

const AuthScreen = () => {
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [hasAccount, switchForm] = useState(false);
  const [boatName, setBoatName] = useState(null);
  const [boatType, setBoatType] = useState(null);

  const userLogin = async () => {
    if (email && password) {
      try {
        await firebase
          .auth()
          .signInWithEmailAndPassword(email, password)
          .then(asyncStorage.set("@loginEmail", email))
          .catch((err) => {
            switch (err.code) {
              case "auth/wrong-password":
                throw new Error("Email or password is incorrect.");
              case "auth/invalid-email":
                throw new Error("Email or password is incorrect.");
              case "auth/user-not-found":
                throw new Error("This email is not registered.");
              default:
                throw new Error("Error at sign in.");
            }
          });

        Alert.alert(`Welcome ${firebase.auth().currentUser.displayName}!`);
      } catch (err) {
        Alert.alert(err.message);
      }
    } else Alert.alert("Fill every field");
  };

  const userRegister = async () => {
    if (name && email && boatName && boatType && password && confirmPassword) {
      if (password === confirmPassword) {
        try {
          await firebase
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .then((res) => {
              res.user.updateProfile({
                displayName: name,
              });
              asyncStorage.set("@loginEmail", email);
            })
            .catch((err) => {
              switch (err.code) {
                case "auth/invalid-email":
                  throw new Error("Email address is invalid.");
                case "auth/email-already-in-use":
                  throw new Error("Email already registered.");
                case "auth/user-not-found":
                  throw new Error("This email is not registered.");
                case "auth/weak-password":
                  throw new Error("Password must be atleast 6 characters.");
                default:
                  throw new Error("Error at sign up.");
              }
            });

          await firebase
            .firestore()
            .collection("userBoats")
            .doc(firebase.auth().currentUser.uid)
            .set({
              boatName: boatName,
              boatType: boatType,
            })
            .catch((err) => {
              throw new Error(err.message);
            });
        } catch (err) {
          Alert.alert(err);
        }

        Alert.alert(`Welcome ${firebase.auth().currentUser.displayName}!`);
      } else Alert.alert("Passwords do not match");
    } else Alert.alert("Fill every field");
  };

  useEffect(() => {
    const getSavedEmail = async () => {
      const savedEmail = await asyncStorage.get("@loginEmail");
      if (savedEmail) setEmail(savedEmail);
    };
    getSavedEmail();
  }, []);

  return (
    <Container>
      <Content>
        <Card>
          {!hasAccount ? (
            <Form>
              <Item stackedLabel>
                <Label>Email</Label>
                <Input
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(val) => setEmail(val)}
                />
              </Item>
              <Item stackedLabel>
                <Label>Password</Label>
                <Input
                  value={password}
                  onChangeText={(val) => setPassword(val)}
                  secureTextEntry
                />
              </Item>
              <Button
                style={{ alignSelf: "center", margin: 10 }}
                onPress={() => userLogin()}
              >
                <Text>Login</Text>
              </Button>

              <Button transparent onPress={() => switchForm(!hasAccount)}>
                <Text>Don't have account? Click here to SignUp</Text>
              </Button>
            </Form>
          ) : (
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
                <Label>Password</Label>
                <Input
                  value={password}
                  onChangeText={(val) => setPassword(val)}
                  secureTextEntry
                />
              </Item>
              <Item stackedLabel>
                <Label>Confirm Password</Label>
                <Input
                  value={confirmPassword}
                  onChangeText={(val) => setConfirmPassword(val)}
                  secureTextEntry
                />
              </Item>
              <Button
                style={{ alignSelf: "center", margin: 10 }}
                onPress={() => userRegister()}
              >
                <Text>Register</Text>
              </Button>

              <Button transparent onPress={() => switchForm(!hasAccount)}>
                <Text>Have account already? Click here to SignIn</Text>
              </Button>
            </Form>
          )}
        </Card>
      </Content>
    </Container>
  );
};

export default AuthScreen;
