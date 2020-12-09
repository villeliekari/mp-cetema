import React, {useEffect, useState} from "react";
import {Body, Card, CardItem, Container, Content, Text, H3} from "native-base";
import MapView, {Marker, PROVIDER_GOOGLE} from "react-native-maps";

const NauticalScreenSingle = (props) => {
  const [nauticalWarning, setNauticalWarning] = useState(null);

  useEffect(() => {
    setNauticalWarning(props.route.params.warning);
  }, []);

  return (
    <Container>
      {nauticalWarning ?
        <>
          <Content>
            <Card>
              <CardItem>
                <H3>{nauticalWarning.properties.areasEn}
                </H3>
              </CardItem>
              <CardItem><Text>
                {nauticalWarning.properties.locationEn}:{" "}
                {nauticalWarning.properties.contentsEn}</Text>
              </CardItem>
              <CardItem>
                <MapView style={{flex: 1, height: 200}}
                  initialRegion={{
                    latitude: nauticalWarning.geometry.coordinates[1],
                    longitude: nauticalWarning.geometry.coordinates[0],
                    latitudeDelta: 0.3,
                    longitudeDelta: 0.3,
                  }}
                  provider={PROVIDER_GOOGLE}>
                  <Marker
                    key={'asd'}
                    coordinate={{
                      latitude: nauticalWarning.geometry.coordinates[1],
                      longitude: nauticalWarning.geometry.coordinates[0],
                    }}
                    title={nauticalWarning.properties.locationEn}
                  />
                </MapView>
              </CardItem>
            </Card>
          </Content>
        </> : <Text>Loading</Text>}
    </Container>
  );
};

export default NauticalScreenSingle;
