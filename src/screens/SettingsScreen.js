import React from 'react';
import { Button, Container, Text } from 'native-base';
import fb from '../helpers/Firebase';

const SettingsScreen = () => {
  return (
    <Container>
      <Text>Settings screen</Text>
      <Text>Firebase uid: {fb.auth().currentUser.uid}</Text>
      <Text>Firebase displayName: {fb.auth().currentUser.displayName}</Text>
      <Text>Firebase email: {fb.auth().currentUser.email}</Text>
      <Button onPress={() => fb.auth().signOut()}>
        <Text>Logout</Text>
      </Button>
    </Container>
  );
}

export default SettingsScreen;