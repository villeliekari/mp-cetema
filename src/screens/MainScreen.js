import React, { useEffect, useState } from "react";
import { Container } from "native-base";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { mapStyleDark } from "../styles/MapStyleDark";
import * as Location from "expo-location";

import fb from "../helpers/Firebase";

const MainScreen = () => {
  const [location, setLocation] = useState(null);
  const [shipLocations, setShipLocations] = useState(null);
  const [shipMetadata, setShipMetadata] = useState(null);
  const [userLocations, setUserLocations] = useState(null);
  const [shipMarkers, setShipMarkers] = useState([]);
  const [userMarkers, setUserMarkers] = useState([]);

  const fetchData = async () => {
    console.log("Fetching data...");
    const success = (res) => (res.ok ? res.json() : Promise.resolve({}));
    const locations = fetch(
      "https://meri.digitraffic.fi/api/v1/locations/latest"
    ).then(success);
    const metadata = fetch(
      "https://meri.digitraffic.fi/api/v1/metadata/vessels"
    ).then(success);

    fb.database()
      .ref("/userLocations")
      .orderByKey()
      .once("value")
      .then((snap) => {
        let userLocationsData = [];
        snap.forEach((childSnap) => {
          userLocationsData.push(childSnap.val());
        });
        setUserLocations(userLocationsData);
      });

    try {
      const [locationsFetch, metadataFetch] = await Promise.all([
        locations,
        metadata,
      ]);
      setShipLocations(locationsFetch.features);
      setShipMetadata(metadataFetch);
    } catch (err) {
      return console.log(err);
    }
  };

  const getMarkers = () => {
    if (shipLocations && shipMetadata && userLocations) {
      console.log("Updating markers...");
      const currentTime = Date.now();
      const filterTime = currentTime - 60000;
      const combinedResult = shipLocations
        .filter((i) => i.properties.timestampExternal >= filterTime)
        .map((locaObj) => ({
          ...shipMetadata.find((metaObj) => metaObj.mmsi === locaObj.mmsi),
          ...locaObj,
        }));

      setShipMarkers(combinedResult);
      setUserMarkers(userLocations);
    }
  };

  const updateUserLocationToFirebase = () => {
    if (location) {
      const currentLocation = {
        ...location,
        uid: fb.auth().currentUser.uid,
        username: fb.auth().currentUser.displayName,
        //boatname and so on.
      };
      fb.database()
        .ref(`/userLocations/${fb.auth().currentUser.uid}`)
        .set(currentLocation);
    }
  };

  const getUserLocation = async () => {
    console.log("Getting user location...");
    let { status } = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
    }

    let _location = await Location.getCurrentPositionAsync({});
    setLocation(_location);
  };

  //UseEffects
  useEffect(() => {
    fetchData();
    getUserLocation();
    const interval = setInterval(() => {
      fetchData();
      getUserLocation();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    updateUserLocationToFirebase();
    getMarkers();
  }, [shipLocations, shipMetadata, userLocations]);

  return (
    <Container>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 60.1587262,
          longitude: 24.922834,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyleDark}
        showsMyLocationButton={true}
      >
        {shipMarkers.map((res, i) => {
          const currentTime = Date.now();
          const vesselIcon =
            res.shipType > 60
              ? require("../../assets/cargoshipicon.png")
              : require("../../assets/boaticon.png");
          return (
            <Marker
              key={i}
              coordinate={{
                latitude: res.geometry.coordinates[1],
                longitude: res.geometry.coordinates[0],
              }}
              title={res.mmsi.toString()}
              description={`${
                (currentTime - res.properties.timestampExternal) / 1000
              }s ago, shiptype: ${res.shipType}, ship name: ${res.name}`}
              image={vesselIcon}
            />
          );
        })}
        {userMarkers.map((res, i) => {
          const userIcon =
            res.uid === fb.auth().currentUser.uid
              ? require("../../assets/selficon.png")
              : require("../../assets/usericon.png");
          return (
            <Marker
              key={i}
              coordinate={{
                latitude: res.coords.latitude,
                longitude: res.coords.longitude,
              }}
              title={res.uid}
              description={`username: ${res.username}`}
              image={userIcon}
            />
          );
        })}
      </MapView>
    </Container>
  );
};

export default MainScreen;
