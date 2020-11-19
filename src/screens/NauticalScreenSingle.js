import React, { useEffect, useState } from "react";
import { Body, Card, CardItem, Container, Content, Text } from "native-base";

const NauticalScreenSingle = (props) => {
  const [nauticalWarning, setNauticalWarning] = useState({});

  useEffect(() => {
    setNauticalWarning(props.route.params.warning.properties);
  }, []);

  return (
    <Container>
      <Content>
        <Body>
          <Card>
            <CardItem>
              <Text>
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
