import React from 'react';
import { Body, Button, Container, Content, Text } from 'native-base';
import fb from '../helpers/Firebase';

const SettingsScreen = () => {
  return (
    <Container>
      <Content>
        <Body>
          <Text>Settings screen</Text>
          <Text>Firebase uid: {fb.auth().currentUser.uid}</Text>
          <Text>Firebase displayName: {fb.auth().currentUser.displayName}</Text>
          <Text>Firebase email: {fb.auth().currentUser.email}</Text>
          <Button onPress={() => fb.auth().signOut()}>
            <Text>Logout</Text>
          </Button>
        </Body>
      </Content>
    </Container>
  );
}

export default SettingsScreen;