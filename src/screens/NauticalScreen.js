import React, {useEffect, useState} from "react";
import {Body, Card, CardItem, Container, Content, Text, Button, H3} from "native-base";
import { useTheme } from "@react-navigation/native";

const NauticalScreen = (props) => {
  const [nauticalWarnings, setNauticalWarnings] = useState([]);
  const { colors } = useTheme();

  const containerStyle = {
    backgroundColor: colors.background,
  };

  const textStyle = {
    color: colors.text,
  };

  const fetchData = () => {
    fetch("https://meri.digitraffic.fi/api/v1/nautical-warnings/published")
      .then((response) => response.json())
      .then((data) => setNauticalWarnings(data.features));
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      fetchData();
    }
    return () => (mounted = false);
  }, []);

  return (
    <Container>
      <Content>
          {nauticalWarnings.map((warning, i) => {
            return (
              <Card key={i} style={{marginLeft: 10, marginRight: 10}}>
                  <CardItem>
                    <H3
                    style={textStyle}
                      onPress={() =>
                        props.navigation.navigate("Nautical Warning", {
                          warning,
                        })}>{warning.properties.areasEn}
                    </H3>
                  </CardItem>
                  <CardItem style={containerStyle}><Text style={textStyle} onPress={() =>
                    props.navigation.navigate("Nautical Warning", {
                      warning,
                    })}>
                    {warning.properties.locationEn}:{" "}
                    {warning.properties.contentsEn}</Text>
                  </CardItem>
                </Card>
            );
          })}
      </Content>
    </Container>
  );
};

export default NauticalScreen;
