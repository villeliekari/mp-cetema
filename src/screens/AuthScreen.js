import React, { useEffect, useState } from "react";
import {
  Body,
  Button,
  Container,
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

  const userLogin = () => {
    if (email && password) {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(asyncStorage.set("@loginEmail", email))
        .catch((err) => {
          switch (err.code) {
            case "auth/wrong-password":
              return Alert.alert("Email or password is incorrect.");
            case "auth/invalid-email":
              return Alert.alert("Email or password is incorrect.");
            case "auth/user-not-found":
              return Alert.alert("This email is not registered.");
            default:
              return Alert.alert("Error at sign in.");
          }
        });
    } else Alert.alert("Fill every field");
  };

  const userRegister = () => {
    if (name && email && password && confirmPassword) {
      if (password === confirmPassword) {
        firebase
          .auth()
          .createUserWithEmailAndPassword(email, password)
          .then((res) => {
            res.user.updateProfile({
              displayName: name,
            });
            setLastLoginEmail;
          })
          .catch((err) => {
            switch (err.code) {
              case "auth/invalid-email":
                return Alert.alert("Email address is invalid.");
              case "auth/email-already-in-use":
                return Alert.alert("Email already registered.");
              case "auth/user-not-found":
                return Alert.alert("This email is not registered.");
              case "auth/weak-password":
                return Alert.alert("Password must be atleast 6 characters.");
              default:
                return Alert.alert("Error at sign up.");
            }
          });
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
      <Body>
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
      </Body>
    </Container>
  );
};

export default AuthScreen;
