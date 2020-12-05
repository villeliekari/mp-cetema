import React, { useState } from "react";
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
import fb from "../helpers/Firebase";
import {useTheme} from '../helpers/ThemeContext';

const AuthScreen = () => {
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [hasAccount, switchForm] = useState(false);
  const {colors, isDark} = useTheme();

  const containerStyle = {
    backgroundColor: colors.background
  };

  const primary ={
    backgroundColor: colors.primary
  }

  const textStyle = {
    color: colors.text
  }

  const userLogin = () => {
    if (email && password) {
      fb.auth()
        .signInWithEmailAndPassword(email, password)
        .then()
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
        fb.auth()
          .createUserWithEmailAndPassword(email, password)
          .then((res) => {
            res.user.updateProfile({
              displayName: name,
            });
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

  return (
    <Container style={containerStyle}>
      <Body style={containerStyle}>
        {!hasAccount ? (
          <Form  style={containerStyle}>
            <Item stackedLabel>
              <Label style={textStyle}>Email</Label>
              <Input style={textStyle}
                autoCapitalize="none"
                value={email}
                onChangeText={(val) => setEmail(val)}
              />
            </Item>
            <Item stackedLabel>
              <Label style={textStyle}>Password</Label>
              <Input style={textStyle}
                value={password}
                onChangeText={(val) => setPassword(val)}
                secureTextEntry
              />
            </Item>
            <Button 
              style={{ alignSelf: "center", margin: 10 }}
              onPress={() => userLogin()}
            >
              <Text style={textStyle}>Login</Text>
            </Button>

            <Button transparent onPress={() => switchForm(!hasAccount)}>
              <Text>Don't have account? Click here to SignUp</Text>
            </Button>
          </Form>
        ) : (
          <Form>
            <Item stackedLabel>
              <Label style={textStyle}>Name</Label>
              <Input style={textStyle} value={name} onChangeText={(val) => setName(val)} />
            </Item>
            <Item stackedLabel>
              <Label style={textStyle}>Email</Label>
              <Input
               style={textStyle}
                autoCapitalize="none"
                value={email}
                onChangeText={(val) => setEmail(val)}
              />
            </Item>
            <Item stackedLabel>
              <Label style={textStyle}>Password</Label>
              <Input
              style={textStyle}
                value={password}
                onChangeText={(val) => setPassword(val)}
                secureTextEntry
              />
            </Item>
            <Item stackedLabel>
              <Label style={textStyle}>Confirm Password</Label>
              <Input style={textStyle}
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
