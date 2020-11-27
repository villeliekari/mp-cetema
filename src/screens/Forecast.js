import React, {useEffect, useState} from "react";
import {
  Body,
  Button,
  Card,
  CardItem,
  Container,
  Content,
  Text,
  H1
} from "native-base";
import weatherApi from "../helpers/WeatherApi";

const Forecast = (props) => {
  const [seaObs, setSeaObs] = useState([]);
  const [weatherObs, setWeatherObs] = useState([]);

  const fetchToken = () => {
    fetch('https://pfa.foreca.com/authorize/token?user=' + (weatherApi.user) + '&password=' + (weatherApi.password), {
      method: 'POST'
    })
      .then((response) => response.json())
      //If response is in json then in success
      .then((responseJson) => {
        //Success
        token = responseJson.access_token;
        fetch("https://pfa.foreca.com/api/v1/marine/forecast/hourly/:location?location= 24.940266, 60.148091&token=" + token)
          .then((response) => response.json())
          .then((responseJson) => {
            setSeaObs(responseJson.forecast);
          })
        fetch("https://pfa.foreca.com/api/v1/forecast/hourly/:location?location= 24.940266, 60.148091&token=" + token)
          .then((response) => response.json())
          .then((responseJson) => {
            setWeatherObs(responseJson.forecast);
          })
      });
  }




  useEffect(() => {
    let mounted = true;
    if (mounted) {
      fetchToken();
    }
    return () => (mounted = false);
  }, []);

  return (
    <Container>
      <Content ref={c => (this.component = c)}>
        <Body>
          <Card>
            <H1>Marine forecast at your location</H1>
          </Card>
          {seaObs.map((item, i) => {
            return (
              <Card key={i}>
                <CardItem>
                  <Text>{item.time ? `Time: ${item.time}` : "Can't fetch time"}</Text>
                </CardItem>
                <CardItem>
                  <Text>{item.seaTemp ? `Seawater temperature: ${item.seaTemp}°C` : "Can't fetch temp"}</Text>
                </CardItem>
                <CardItem>
                  <Text>{item.sigWaveHeight ? `Wave height: ${item.sigWaveHeight}m` : "Can't fetch wave height"}</Text>
                </CardItem>
                <CardItem>
                  <Text>{item.waveDir ? `Wave direction: ${item.waveDir}` : "Can't fetch wave dir"}</Text>
                </CardItem>
              </Card>
            );
          })}
          <Button block light
            onPress={() => this.component._root.scrollToPosition(0, 0)}>
            <Text>Back to top</Text>
          </Button>
        </Body>
      </Content>
    </Container>
  );
};

export default Forecast;
