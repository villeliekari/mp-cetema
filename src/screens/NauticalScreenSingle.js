import React, { useEffect, useState, useContext } from "react";
import {
  Body,
  Card,
  CardItem,
  Container,
  Content,
  Text,
  H3,
} from "native-base";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useTheme } from "@react-navigation/native";
import { mapStyleDark, mapStyleLight } from "../styles/MapStyleDark";
import ThemeContext from "../helpers/ThemeContext";

const NauticalScreenSingle = (props) => {
  const [nauticalWarning, setNauticalWarning] = useState(null);
  const { isDarkTheme } = useContext(ThemeContext);

  const { colors } = useTheme();

  const containerStyle = {
    backgroundColor: colors.background,
  };

  const textStyle = {
    color: colors.text,
  };

  useEffect(() => {
    setNauticalWarning(props.route.params.warning);
  }, []);

  return (
    <Container style={containerStyle}>
      {nauticalWarning ? (
        <>
          <Content>
            <Card>
              <CardItem style={containerStyle}>
                <H3 style={textStyle}>{nauticalWarning.properties.areasEn}</H3>
              </CardItem>
              <CardItem style={containerStyle}>
                <Text style={textStyle}>
                  {nauticalWarning.properties.locationEn}:{" "}
                  {nauticalWarning.properties.contentsEn}
                </Text>
              </CardItem>
              <CardItem style={containerStyle}>
                <MapView
                  style={{ flex: 1, height: 200 }}
                  initialRegion={{
                    latitude: nauticalWarning.geometry.coordinates[1],
                    longitude: nauticalWarning.geometry.coordinates[0],
                    latitudeDelta: 0.3,
                    longitudeDelta: 0.3,
                  }}
                  customMapStyle={isDarkTheme ? mapStyleDark : mapStyleLight}
                  provider={PROVIDER_GOOGLE}
                >
                  <Marker
                    key={"asd"}
                    coordinate={{
                      latitude: nauticalWarning.geometry.coordinates[1],
                      longitude: nauticalWarning.geometry.coordinates[0],
                    }}
                    title={nauticalWarning.properties.locationEn}
                    //image={require("../../assets/warning.png")}
                  />
                </MapView>
              </CardItem>
            </Card>
          </Content>
        </>
      ) : (
        <Text>Loading</Text>
      )}
    </Container>
  );
};

export default NauticalScreenSingle;
