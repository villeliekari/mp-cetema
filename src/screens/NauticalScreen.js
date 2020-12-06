import React, {useEffect, useState} from "react";
import {Body, Card, CardItem, Container, Content, Text, Button} from "native-base";
import {useTheme} from "../helpers/ThemeContext";

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
    <Container style={{backgroundColor: colors.background}}>
      <Content>
        <Body>
          {nauticalWarnings.map((warning, i) => {
            return (
              <Card key={i}>
                <CardItem style={{backgroundColor: colors.background}}>
                  <Text
                    style={{color:colors.text}}
                    onPress={() =>
                      props.navigation.navigate("Nautical Warning", {warning})
                    }
                  >
                    {warning.properties.areasEn},{" "}
                    {warning.properties.locationEn}:{" "}
                    {warning.properties.contentsEn}
                  </Text>
                </CardItem>
              </Card>
            );
          })}
          <Button block light style={{backgroundColor:colors.primary}}
            onPress={() => this.component._root.scrollToPosition(0, 0)}>
            <Text>Back to top</Text>
          </Button>
        </Body>
      </Content>
    </Container>
  );
};

export default NauticalScreen;
