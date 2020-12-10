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
import { useTheme } from "@react-navigation/native";

const ModifyScreen = (props) => {
  const [currentPassword, setCurrentPassword] = useState(null);
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [boatName, setBoatName] = useState(null);
  const [boatType, setBoatType] = useState(null);

  const { colors } = useTheme();

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

  const deleteUserLocationData = () => {
    Alert.alert(
      "Are you sure you want to delete your location data?",
      "This will remove your marker from others and disable collision warnings.",
      [
        {
          text: "Yes",
          onPress: async () => {
            try {
              await firebase
                .firestore()
                .collection("userLocations")
                .doc(firebase.auth().currentUser.uid)
                .delete()
                .catch((err) => {
                  throw new Error(err.message);
                });

              Alert.alert("Location data deleted");
              props.navigation.navigate("Settings");
            } catch (err) {
              Alert.alert(err);
            }
          },
        },
        { text: "No", style: "cancel" },
      ],
      { cancelable: false }
    );
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
      <Content style={containerStyle}>
        <Card style={containerStyle}>
          <CardItem header bordered style={containerStyle}>
            <Text style={{ color: colors.text }}>Change my infromation</Text>
          </CardItem>
          <Form style={containerStyle}>
            <Item stackedLabel>
              <Label style={{ color: colors.text }}>Name</Label>
              <Input
                style={{ color: colors.text }}
                value={name}
                onChangeText={(val) => setName(val)}
              />
            </Item>
            <Item stackedLabel>
              <Label style={{ color: colors.text }}>Email</Label>
              <Input
                style={{ color: colors.text }}
                autoCapitalize="none"
                value={email}
                onChangeText={(val) => setEmail(val)}
              />
            </Item>
            <Item stackedLabel>
              <Label style={{ color: colors.text }}>Current Password</Label>
              <Input
                style={{ color: colors.text }}
                secureTextEntry
                onChangeText={(val) => setCurrentPassword(val)}
              />
            </Item>
            <Button
              info
              transparent
              style={{ alignSelf: "center", margin: 10 }}
              onPress={updateUserInfo}
            >
              <Text>Update information</Text>
            </Button>
          </Form>
        </Card>

        <Card style={containerStyle}>
          <CardItem header bordered style={containerStyle}>
            <Text style={{ color: colors.text }}>Change Password</Text>
          </CardItem>
          <Form style={containerStyle}>
            <Item stackedLabel>
              <Label style={{ color: colors.text }}>Current Password</Label>
              <Input
                style={{ color: colors.text }}
                secureTextEntry
                onChangeText={(val) => setCurrentPassword(val)}
              />
            </Item>
            <Item stackedLabel>
              <Label style={{ color: colors.text }}>New Password</Label>
              <Input
                style={{ color: colors.text }}
                secureTextEntry
                value={password}
                onChangeText={(val) => setPassword(val)}
              />
            </Item>
            <Item stackedLabel>
              <Label style={{ color: colors.text }}>Confirm new password</Label>
              <Input
                style={{ color: colors.text }}
                secureTextEntry
                value={confirmPassword}
                onChangeText={(val) => setConfirmPassword(val)}
              />
            </Item>
            <Button
              info
              transparent
              style={{ alignSelf: "center", margin: 10 }}
              onPress={updateUserPassword}
            >
              <Text>Update password</Text>
            </Button>
          </Form>
        </Card>

        <Card style={containerStyle}>
          <CardItem header bordered style={containerStyle}>
            <Text style={{ color: colors.text }}>Change boat infromation</Text>
          </CardItem>
          <Form style={containerStyle}>
            <Item stackedLabel>
              <Label style={{ color: colors.text }}>Boat name</Label>
              <Input
                style={{ color: colors.text }}
                value={boatName}
                onChangeText={(val) => setBoatName(val)}
              />
            </Item>
            <Item stackedLabel>
              <Label style={{ color: colors.text }}>Boat type</Label>
              <Input
                style={{ color: colors.text }}
                value={boatType}
                onChangeText={(val) => setBoatType(val)}
              />
            </Item>
            <Item stackedLabel>
              <Label style={{ color: colors.text }}>Current Password</Label>
              <Input
                style={{ color: colors.text }}
                secureTextEntry
                onChangeText={(val) => setCurrentPassword(val)}
              />
            </Item>
            <Button
              info
              transparent
              style={{ alignSelf: "center", margin: 10 }}
              onPress={updateBoatInfo}
            >
              <Text>Update boat information</Text>
            </Button>
          </Form>
        </Card>

        <Card style={containerStyle}>
          <CardItem header bordered style={containerStyle}>
            <Text style={{ color: colors.text }}>Delete location data</Text>
          </CardItem>
          <Body>
            <Button
              danger
              transparent
              style={{ alignSelf: "center", margin: 10 }}
              onPress={deleteUserLocationData}
            >
              <Text>Delete location data</Text>
            </Button>
          </Body>
        </Card>
      </Content>
    </Container>
  );
};

export default ModifyScreen;
