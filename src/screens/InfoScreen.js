import React, {useEffect, useState} from "react";
import {
  Body,
  Button,
  Card,
  CardItem,
  Container,
  Content,
  Text,
} from "native-base";

const InfoScreen = (props) => {
  const [nauticalWarnings, setNauticalWarnings] = useState([]);
  const [seaObs, setSeaObs] = useState([]);

  const fetchData = () => {
    fetch("https://meri.digitraffic.fi/api/v1/nautical-warnings/published")
      .then((response) => response.json())
      .then((data) => setNauticalWarnings(data.features));
  };

  const fetchToken = () => {
    fetch('https://pfa.foreca.com/authorize/token?user=daniel-finnerman&password=LQ7gKLa3mzTkFoWgTh', {
      method: 'POST'
    })
      .then((response) => response.json())
      //If response is in json then in success
      .then((responseJson) => {
        //Success
        console.log(responseJson.access_token);
        token = responseJson.access_token;
        fetch("https://pfa.foreca.com/api/v1/marine/forecast/hourly/:location?location= 24.940266, 60.148091&token=" + token)
          .then((response) => response.json())
          .then((responseJson) => {
            console.log("Seatemp: " + responseJson.forecast[0].seaTemp + "°C");
            console.log("Waveheight: " + responseJson.forecast[0].sigWaveHeight + "m");
            console.log("Wave direction: " + responseJson.forecast[0].waveDir);
            setSeaObs(responseJson.forecast);
          })
      });
  }




  useEffect(() => {
    let mounted = true;
    if (mounted) {
      fetchData();
      fetchToken();
    }
    return () => (mounted = false);
  }, []);

  return (
    <Container>
      <Content>
        <Body>
          {nauticalWarnings.map((warning, i) => {
            if (i < 2) {
              return (
                <Card key={i}>
                  <CardItem>
                    <Text
                      onPress={() =>
                        props.navigation.navigate("Nautical Warning", {
                          warning,
                        })
                      }
                    >
                      {warning.properties.areasEn},{" "}
                      {warning.properties.locationEn}:{" "}
                      {warning.properties.contentsEn}
                    </Text>
                  </CardItem>
                </Card>
              );
            }
          })}
          <Button
            onPress={() => props.navigation.navigate("Nautical Warnings")}
          >
            <Text>Show all Nautical Warnings</Text>
          </Button>
          <Card>
            <CardItem>
              <Text>{seaObs[0] ? `Sea temperature: ${seaObs[0].seaTemp}°C` : "Can't fetch temperature"}</Text>
            </CardItem>
            <CardItem>
              <Text>{seaObs[0] ? `Wave height: ${seaObs[0].sigWaveHeight}m` : "Can't fetch wave height"}</Text>
            </CardItem>
          </Card>
        </Body>
      </Content>
    </Container>
  );
};

export default InfoScreen;
