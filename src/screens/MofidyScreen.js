import React, { useEffect, useState } from "react";
import {
  Body,
  Button,
  Container,
  Content,
  Form,
  Input,
  Item,
  Label,
  Text,
} from "native-base";
import fb from "../helpers/Firebase";
import { Alert } from "react-native";
import { useTheme } from "../helpers/ThemeContext";

const ModifyScreen = (props) => {
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);

  const { colors, isDark } = useTheme();

  const containerStyle = {
    backgroundColor: colors.background,
  };

  const textStyle = {
    color: colors.text,
  };

  const updateUserInfo = () => {
    try {
      if (
        fb.auth().currentUser.displayName !== name ||
        fb.auth().currentUser.email !== email
      ) {
        fb.auth()
          .currentUser.updateProfile({ displayName: name })
          .catch((err) => Alert.alert(err.message));
        fb.auth()
          .currentUser.updateEmail(email)
          .catch((err) => Alert.alert(err.message));
      } else if (password && confirmPassword && password === confirmPassword) {
        fb.auth()
          .currentUser.updatePassword(password)
          .catch((err) => Alert.alert(err.message));
      } else Alert.alert("Nothing to update");
    } catch (err) {
      Alert.alert(err.message);
    }
  };

  useEffect(() => {
    setName(fb.auth().currentUser.displayName);
    setEmail(fb.auth().currentUser.email);
    console.log("useeffec");
  }, []);

  return (
    <Container style={containerStyle}>
      <Content>
        <Form>
          <Item stackedLabel>
            <Label>New Name</Label>
            <Input value={name} onChangeText={(val) => setName(val)} />
          </Item>
          <Item stackedLabel>
            <Label>New Email</Label>
            <Input
              autoCapitalize="none"
              value={email}
              onChangeText={(val) => setEmail(val)}
            />
          </Item>
          <Item stackedLabel>
            <Label>New password</Label>
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
            style={{ alignSelf: "center", margin: 10 }}
            onPress={() => updateUserInfo()}
          >
            <Text>Update</Text>
          </Button>
        </Form>
      </Content>
    </Container>
  );
};

export default ModifyScreen;
