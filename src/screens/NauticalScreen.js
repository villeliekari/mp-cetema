import React, {useEffect, useState} from "react";

import {useTheme} from "../helpers/ThemeContext";
import {Body, Card, CardItem, Container, Content, Text, Button, H3} from "native-base";

const NauticalScreen = (props) => {
  const [nauticalWarnings, setNauticalWarnings] = useState([]);
  const {colors} = useTheme();

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
    <Container style={{backgroundColor: colors.background}>
      <Content ref={c => (this.component = c)}>
          {nauticalWarnings.map((warning, i) => {
            return (
              <Card key={i}>
                  <CardItem>
                    <H3
                      onPress={() =>
                        props.navigation.navigate("Nautical Warning", {
                          warning,
                        })}>{warning.properties.areasEn}
                    </H3>
                  </CardItem>
                  <CardItem><Text onPress={() =>
                    props.navigation.navigate("Nautical Warning", {
                      warning,
                    })}>
                    {warning.properties.locationEn}:{" "}
                    {warning.properties.contentsEn}</Text>
                  </CardItem>
                </Card>
            );
          })}
          <Button block light style={{backgroundColor:colors.primary}}
            onPress={() => this.component._root.scrollToPosition(0, 0)}>
            <Text>Back to top</Text>
          </Button>
      </Content>
    </Container>
  );
};

export default NauticalScreen;
