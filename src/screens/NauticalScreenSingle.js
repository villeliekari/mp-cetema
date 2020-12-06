import React, { useEffect, useState } from "react";
import { Body, Card, CardItem, Container, Content, Text } from "native-base";
import {useTheme} from "../helpers/ThemeContext";

const NauticalScreenSingle = (props) => {
  const [nauticalWarning, setNauticalWarning] = useState({});
  const {colors} = useTheme();

  useEffect(() => {
    setNauticalWarning(props.route.params.warning.properties);
  }, []);

  return (
    <Container style={{backgroundColor:colors.background}}>
      <Content>
        <Body style={{backgroundColor:colors.background}}>
          <Card>
            <CardItem style={{backgroundColor:colors.background}}>
              <Text style={{color:colors.text}}>
                {nauticalWarning.areasEn}, {nauticalWarning.locationEn}:{" "}
                {nauticalWarning.contentsEn}
              </Text>
            </CardItem>
          </Card>
        </Body>
      </Content>
    </Container>
  );
};

export default NauticalScreenSingle;
