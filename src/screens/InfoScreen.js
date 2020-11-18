import React, { useEffect, useState } from 'react';
import { Body, Button, Card, CardItem, Container, Content, Text } from 'native-base';

const InfoScreen = (props) => {
  const [nauticalWarnings, setNauticalWarnings] = useState([]);

  const fetchData = () => {
    fetch('https://meri.digitraffic.fi/api/v1/nautical-warnings/published')
      .then((response) => response.json())
      .then(data => setNauticalWarnings(data.features))
  }

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      fetchData();
    }
    return () => mounted = false;
  }, [])

  return (
    <Container>
      <Content>
        <Body>
          {nauticalWarnings.map((warning, i) => {
            if (i < 3) {
              return (
                <Card key={i}>
                  <CardItem>
                    <Text onPress={() => props.navigation.navigate('Nautical Warning', { warning })}>
                      {warning.properties.areasEn}, {warning.properties.locationEn}: {warning.properties.contentsEn}
                    </Text>
                  </CardItem>
                </Card>
              );
            }
          })}
          <Button onPress={() => props.navigation.navigate('Nautical Warnings')}>
            <Text>Show all Nautical Warnings</Text>
          </Button>
        </Body>
      </Content>
    </Container>
  );
}

export default InfoScreen;