import React, { useEffect, useState } from "react";
import {Image} from 'react-native';
import {
  Body,
  Button,
  Card,
  CardItem,
  Container,
  Content,
  Text
} from "native-base";
import * as Location from "expo-location";
import weatherApi from "../helpers/WeatherApi";
import { useTheme } from "@react-navigation/native";

const InfoScreen = (props) => {
  const [nauticalWarnings, setNauticalWarnings] = useState([]);
  const [seaObs, setSeaObs] = useState([]);
  const [weatherObs, setWeatherObs] = useState({});

  const { colors } = useTheme();

  const containerStyle = {
    backgroundColor: colors.background
  };

  const textStyle = {
    color: colors.text
  }

  const fetchData = () => {
    fetch("https://meri.digitraffic.fi/api/v1/nautical-warnings/published")
      .then((response) => response.json())
      .then((data) => setNauticalWarnings(data.features));
  };

  const getLocAndFetch = async () => {
    console.log("Forecast user location..");
    let {status} = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
    }

    // should update if location changes by 20m and every 5s
    // but doesn't distanceinterval overrites timeinterval, big suck
    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 10,
        timeInterval: 5000
      },
      (_location) => {
        // correct data structure could be set here
        fetch('https://pfa.foreca.com/authorize/token?user=' + (weatherApi.user) + '&password=' + (weatherApi.password), {
          method: 'POST'
        })
          .then((response) => response.json())
          //If response is in json then in success
          .then((responseJson) => {
            //Success
            token = responseJson.access_token;
            fetch('https://pfa.foreca.com/api/v1/marine/forecast/hourly/:location?location=' + (_location.coords.longitude) + ', ' + (_location.coords.latitude) + '&token=' + token)
              .then((response) => response.json())
              .then((responseJson) => {
                setSeaObs(responseJson.forecast);
              })
            fetch('https://pfa.foreca.com/api/v1/current//:location?location=' + (_location.coords.longitude) + ', ' + (_location.coords.latitude) + '&token=' + token)
              .then((response) => response.json())
              .then((responseJson) => {
                setWeatherObs(responseJson.current);
              })
          });
      }
    );
  };




  useEffect(() => {
    getLocAndFetch();
    fetchData();
  }, []);

  return (
    <Container style={containerStyle}>
      <Content>
        <Body>
          {nauticalWarnings.map((warning, i) => {
            if (i < 1) {
              return (
                <Card key={i} >
                  <CardItem style={containerStyle}>
                    <Text style={textStyle}
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
          <Button block light
            onPress={() => props.navigation.navigate("Nautical Warnings")}
          >
            <Text>Show all Nautical Warnings</Text>
          </Button>
          <Card>
            <CardItem header button onPress={() => props.navigation.navigate("Forecast")}>
              <Text
                style={{fontWeight: "bold"}}>Sea state at your location: </Text>
            </CardItem>
            <CardItem button onPress={() => props.navigation.navigate("Forecast")}>
              <Image source={{uri: 'https://developer.foreca.com/static/images/symbols_pastel/' + (weatherObs.symbol) + '.png'}} style={{
                flex: 1,
                aspectRatio: 4,
                resizeMode: 'contain'
              }} />
            </CardItem>
            <CardItem>
              <Text>{weatherObs.temperature ? `Air temperature: ${weatherObs.temperature}°C` : "Can't fetch air temp"}</Text>
              <Text>{weatherObs.symbolPhrase ? `,  ${weatherObs.symbolPhrase}` : "Can't fetch string"}</Text>
            </CardItem>
            <CardItem>
              <Text>{seaObs[0] ? `Seawater temperature: ${seaObs[0].seaTemp}°C` : "Can't fetch temperature"}</Text>
            </CardItem>
            <CardItem>
              <Text>{weatherObs.windSpeed ? `Wind: ${weatherObs.windSpeed}m/s` : "Can't fetch wind speed"}</Text>
              <Text>{weatherObs.windDirString ? ` ${weatherObs.windDirString}` : "Can't fetch wind dir"}</Text>
            </CardItem>
            <CardItem>
              <Text>{seaObs[0] ? `Wave height: ${seaObs[0].sigWaveHeight}m` : "Can't fetch wave height"}</Text>
            </CardItem>
            <CardItem>
              <Text>{seaObs[0] ? `Wave direction: ${seaObs[0].waveDir}` : "Can't fetch wave direction"}</Text>
            </CardItem>
            <CardItem>
              <Text>{weatherObs.visibility ? `Visibility: ${(weatherObs.visibility / 1000).toFixed(1)}km` : "Can't fetch visibility"}</Text>
            </CardItem>
          </Card>
        </Body>
      </Content>
    </Container>
  );
};

export default InfoScreen;
