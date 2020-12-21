import React, { useEffect, useState, useContext } from "react";
import {
  Container,
  Fab,
  Button,
  View,
  Header,
  Icon,
  Text,
  H3,
} from "native-base";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import { Alert, StyleSheet, Linking } from "react-native";
import { mapStyleDark, mapStyleLight } from "../styles/MapStyleDark";
import * as Location from "expo-location";
import * as geofirestore from "geofirestore";
import * as geokit from "geokit";
import { withinRadius } from "../helpers/Utility";
import * as Notifications from "expo-notifications";
import ThemeContext from "../helpers/ThemeContext";

import firebase from "../helpers/Firebase";
import asyncStorage from "../helpers/AsyncStorage";
import Speedometer from "react-native-speedometer-chart";

const MainScreen = (props) => {
  const [location, setLocation] = useState(null);
  const [shipLocations, setShipLocations] = useState(null);
  const [shipMetadata, setShipMetadata] = useState(null);
  const [shipMarkers, setShipMarkers] = useState([]);
  const [userMarkers, setUserMarkers] = useState([]);
  const [needsRescue, setNeedsRescue] = useState(false);
  const [locationState, setLocationState] = useState(false);
  const [active, setActive] = useState(false);
  const [isSendingSosAlert, setIsSendingSosAlert] = useState(false);
  const [userSpeed, setUserSpeed] = useState(0);
  const [shipMarkersActive, setShipMarkersActive] = useState(true);
  const [nauticalWarningsActive, setNauticalWarningsActive] = useState(true);
  const [followUserActive, setFollowUserActive] = useState(false);
  const [nauticalWarnings, setNauticalWarnings] = useState([]);
  const [collisionDetected, setCollisionDetected] = useState(false);
  const [userWithinRadius, setUserWithinRadius] = useState([]);
  const [boatName, setBoatName] = useState(null);
  const [boatType, setBoatType] = useState(null);
  const { isDarkTheme } = useContext(ThemeContext);
  const [savedUpdateInterval, setSavedUpdateInterval] = useState(null);

  const GeoFirestore = geofirestore.initializeApp(firebase.firestore());

  const fetchData = async () => {
    console.log("Fetching data...");
    const success = (res) => (res.ok ? res.json() : Promise.resolve({}));
    const radius = await asyncStorage.get("@fetchRadius");
    const time = await asyncStorage.get("@fetchTime");
    const date = new Date();
    date.setMinutes(date.getMinutes() - (time ? time : 30));

    const url = `https://meri.digitraffic.fi/api/v1/locations/latitude/${
      location ? location.coords.latitude : "60.1587262"
    }/longitude/${location ? location.coords.longitude : "24.922834"}/radius/${
      radius ? radius : 100
    }/from/${date.toISOString()}`;

    const locations = fetch(url).then(success);
    const metadata = fetch(
      "https://meri.digitraffic.fi/api/v1/metadata/vessels"
    ).then(success);

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

  const fetchWarnings = () => {
    fetch("https://meri.digitraffic.fi/api/v1/nautical-warnings/published")
      .then((response) => response.json())
      .then((data) => setNauticalWarnings(data.features));
  };

  const getUserMarkers = () => {
    if (location) {
      console.log("Updating user markers...");

      // get user locations in 100km radius and last 15 minutes
      // .where can't be used on query because inequality isn't supported
      const geocollection = GeoFirestore.collection("userLocations");

      const filterTime = Date.now() - 900000;
      const query = geocollection.near({
        center: new firebase.firestore.GeoPoint(
          location.coords.latitude,
          location.coords.longitude
        ),
        radius: 100,
      });
      query.onSnapshot((snap) => {
        let array = [];
        let array2 = [];
        snap.forEach((doc) => {
          if (doc.exists && doc.data().timestamp >= filterTime) {
            array.push(doc.data());

            if (doc.id != firebase.auth().currentUser.uid) {
              // set collision alert if user within 200 meters
              // radius in km
              const myLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              };
              const otherLocation = {
                latitude: doc.data().g.geopoint.latitude,
                longitude: doc.data().g.geopoint.longitude,
              };
              const radius = 0.1;

              if (withinRadius(myLocation, otherLocation, radius)) {
                //sendCollisionAlert()
                array2.push(doc.data());
              }
            }
          }
        });
        setUserMarkers(array);
        setUserWithinRadius(array2);
      });
    }
  };

  const sendCollisionAlert = () => {
    if (collisionDetected) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Collision Alert!",
          body: "You are too close to another vessel!",
        },
        trigger: null,
      });
    }
  };

  const getShipMarkers = () => {
    if (shipLocations && shipMetadata) {
      console.log("Updating ship markers...");
      const combinedResult = shipLocations.map((locaObj) => ({
        ...shipMetadata.find((metaObj) => metaObj.mmsi === locaObj.mmsi),
        ...locaObj,
      }));

      setShipMarkers(combinedResult);
    }
  };

  const updateUserLocation = async (location) => {
    if (location) {
      const coords = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
      const geodata = {
        geohash: geokit.hash(coords),
        geopoint: new firebase.firestore.GeoPoint(
          location.coords.latitude,
          location.coords.longitude
        ),
      };
      const locationData = {
        g: geodata,
        heading: location.coords.heading,
        speed: location.coords.speed,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
        uid: firebase.auth().currentUser.uid,
        username: firebase.auth().currentUser.displayName,
        needsRescue: needsRescue,
        boatName: boatName,
        boatType: boatType,
      };
      try {
        await firebase
          .firestore()
          .collection("userLocations")
          .doc(firebase.auth().currentUser.uid)
          .set(locationData, { merge: true })
          .catch((error) => {
            throw new Error("Error adding document: ", error);
          });
      } catch (err) {
        Alert.alert(err.message);
      }
      setLocationState(true);
    }
  };

  const getUserLocation = async () => {
    console.log("Getting user location...");
    let { status } = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
    }

    // should update if location changes by 20m and every 5s
    // but doesn't work properly, because distanceinterval overrites timeinterval, big suck
    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 10,
        timeInterval: 5000,
      },
      (_location) => {
        setUserSpeed(_location.coords.speed);
        setLocation(_location);
        updateUserLocation(_location);
      }
    );
  };

  const sosAlert = () => {
    Alert.alert(
      "SOS Alert",
      "People nearby will receive your alert",
      [
        { text: "Rescued", onPress: () => updateSosAlert("rescued") },
        {
          text: "Cancel",
          onPress: () => updateSosAlert("cancel"),
          style: "cancel",
        },
      ],
      { cancelable: false }
    );
  };

  const receiveSosAlert = (data) => {
    Alert.alert(
      "SOS Alert",
      data[0].username + " needs your help",
      [
        {
          text: "Accept",
          onPress: () => {
            // update firebase doc
            firebase.firestore().collection("sos").doc(data[0].uid).update({
              rescueAccepted: true,
            });
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const updateSosAlert = (option) => {
    if (option == "rescued") {
      firebase
        .firestore()
        .collection("sos")
        .doc(firebase.auth().currentUser.uid)
        .update({
          rescued: true,
          rescueAccepted: false,
        });
      setNeedsRescue(false);
      setIsSendingSosAlert(false);
    } else if (option == "cancel") {
      firebase
        .firestore()
        .collection("sos")
        .doc(firebase.auth().currentUser.uid)
        .delete()
        .then((doc) => {
          console.log("SOS Document successfully deleted!");
        })
        .catch(function (error) {
          console.error("Error removing SOS document: ", error);
        });
      setNeedsRescue(false);
      setIsSendingSosAlert(false);
    }
    console.log("SOS alert updated:", option);
  };

  const sendSosConfirm = () => {
    Alert.alert(
      "SOS Alert",
      "Do you wish to send SOS Alert",
      [
        {
          text: "Yes",
          onPress: () => sendSosAlert(),
        },
        {
          text: "Cancel",
          onPress: () => console.log("cancel"),
          style: "cancel",
        },
      ],
      { cancelable: false }
    );
  };

  const sendSosAlert = () => {
    if (location) {
      const coords = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
      const geodata = {
        geohash: geokit.hash(coords),
        geopoint: new firebase.firestore.GeoPoint(
          location.coords.latitude,
          location.coords.longitude
        ),
      };
      const sosData = {
        g: geodata,
        uid: firebase.auth().currentUser.uid,
        username: firebase.auth().currentUser.displayName,
        rescued: false,
        rescueAccepted: false,
      };
      firebase
        .firestore()
        .collection("sos")
        .doc(firebase.auth().currentUser.uid)
        .set(sosData, { merge: true })
        .then((doc) => {
          console.log("New SOS document added");
        })
        .catch((error) => {
          console.error("Error adding SOS document: ", error);
        });
      setNeedsRescue(true);
      sosAlert();
      setIsSendingSosAlert(true);
    } else {
      Alert.alert("No location found");
    }
  };

  const getSosAlert = () => {
    if (location) {
      const geocollection = GeoFirestore.collection("sos");
      const query = geocollection.near({
        center: new firebase.firestore.GeoPoint(
          location.coords.latitude,
          location.coords.longitude
        ),
        radius: 1,
      });
      query
        .where("rescued", "==", false)
        .where("rescueAccepted", "==", false)
        .onSnapshot((snap) => {
          let array = [];
          snap.forEach((doc) => {
            if (doc.exists && doc.id != firebase.auth().currentUser.uid) {
              array.push(doc.data());
            }
          });
          if (array.length) {
            receiveSosAlert(array);
          }
        });
    }
  };

  const receiveUpdatesOnSosAlert = async () => {
    if (isSendingSosAlert == true) {
      await firebase
        .firestore()
        .collection("sos")
        .doc(firebase.auth().currentUser.uid)
        .onSnapshot((snap) => {
          if (snap.exists && snap.data().rescueAccepted == true) {
            Notifications.scheduleNotificationAsync({
              content: {
                title: "SOS UPDATE!",
                body: "Someone is on its way to help you!",
              },
              trigger: null,
            });
          }
        });
    }
  };

  const toggleShipMarkers = () => {
    setShipMarkersActive(isActive => !isActive);
  };

  const toggleFollowUser = () => {
    setFollowUserActive(!followUserActive);
  };

  const toggleNauticalWarnings = () => {
    setNauticalWarningsActive(isActive => !isActive)
  }

  const getUserBoat = async () => {
    await firebase
      .firestore()
      .collection("userBoats")
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((res) => {
        setBoatName(res.data().boatName);
        setBoatType(res.data().boatType);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const getSavedFromAsyncStorage = async () => {
    const savedUpdateInterval = await asyncStorage.get("@fetchInterval");
    if (savedUpdateInterval)
      setSavedUpdateInterval(savedUpdateInterval * 60000);
  };

  useEffect(() => {
    const interval = setInterval(
      () => {
        fetchData();
      },
      savedUpdateInterval ? savedUpdateInterval : 120000
    );
    return () => clearInterval(interval);
  }, [savedUpdateInterval]);

  useEffect(() => {
    receiveUpdatesOnSosAlert();
  }, [isSendingSosAlert]);

  useEffect(() => {
    getSosAlert();
    getUserMarkers();
  }, [locationState]);

  useEffect(() => {
    updateUserLocation(location);
  }, [needsRescue]);

  useEffect(() => {
    if (userWithinRadius.length > 0) {
      setCollisionDetected(true);
    } else {
      setCollisionDetected(false);
    }
  }, [userWithinRadius]);

  useEffect(() => {
    sendCollisionAlert();
  }, [collisionDetected]);

  useEffect(() => {
    getShipMarkers();
  }, [shipLocations, shipMetadata]);

  useEffect(() => {
    getUserLocation();
    fetchData();
    fetchWarnings();
    getSavedFromAsyncStorage();
    getUserBoat();
  }, []);

  return (
    <Container>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.mapStyle}
          initialRegion={{
            latitude: 60.1587262,
            longitude: 24.922834,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          region={
            followUserActive === true
              ? {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }
              : null
          }
          showsMyLocationButton={false}
          provider={PROVIDER_GOOGLE}
          customMapStyle={isDarkTheme ? mapStyleDark : mapStyleLight}
          showsUserLocation={true}
        >
          {shipMarkers.map((res, i) => {
            const currentTime = Date.now();
            const vesselIcon =
              res.shipType > 60
                ? isDarkTheme
                  ? require("../../assets/cargoshipiconDark.png")
                  : require("../../assets/cargoshipicon.png")
                : isDarkTheme
                ? require("../../assets/boaticonDark.png")
                : require("../../assets/boaticon.png");
            if (shipMarkersActive === true) {
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
                  //image={vesselIcon}
                >
                  <Callout
                    onPress={() => {
                      Linking.openURL(
                        "https://www.marinetraffic.com/fi/ais/details/ships/mmsi:" +
                          res.mmsi.toString()
                      );
                    }}
                  >
                    <Text
                      style={{ fontWeight: "bold", justifyContent: "center" }}
                    >
                      {res.name}
                    </Text>
                    <Text>{`${Math.round(
                      (currentTime - res.properties.timestampExternal) / 1000
                    )} seconds ago`}</Text>
                    <Text>{`MMSI: ${res.mmsi.toString()}`}</Text>
                    <Text>
                      {`Speed: ${res.properties.sog} knots / ` +
                        `${Math.round(res.properties.sog * 1.852)} km/h`}
                    </Text>
                    <Text style={{ color: "blue" }}>Click for more info</Text>
                    <Text style={{ color: "blue" }}>(opens browser)</Text>
                  </Callout>
                </Marker>
              );
            }
          })}
          {userMarkers.map((res, i) => {
            // Get only other users markers and use one in mapview for self
            // (showsUserLocation={true})
            if (firebase.auth().currentUser.uid !== res.uid) {
              const icon =
                res.needsRescue === true
                  ? require("../../assets/help.png")
                  : require("../../assets/usericon.png");
              return (
                <Marker
                  key={i}
                  coordinate={{
                    latitude: res.g.geopoint.latitude,
                    longitude: res.g.geopoint.longitude,
                  }}
                  title={res.username}
                  description={`type: ${res.boatType}, name: ${
                    res.boatName
                  }, time: ${(Date.now() - res.timestamp) / 1000}s ago`}
                  //image={icon}
                >
                  <Callout>
                    <Text
                      style={{ fontWeight: "bold", justifyContent: "center" }}
                    >
                      {res.username}
                    </Text>
                    <Text>{`${Math.round(
                      (Date.now() - res.timestamp) / 1000
                    )} seconds ago`}</Text>
                    <Text>{`Name: ${res.boatName}`}</Text>
                    <Text>{`Type: ${res.boatType}`}</Text>
                  </Callout>
                </Marker>
              );
            }
          })}
          {nauticalWarnings.map((res, i) => {
            if (nauticalWarningsActive === true) {
            return (
              <Marker
                key={i}
                coordinate={{
                  latitude: res.geometry.coordinates[1],
                  longitude: res.geometry.coordinates[0],
                }}
                //image={require("../../assets/warning.png")}
              >
                <Callout
                  style={{ flex: 1, width: 250, height: 200 }}
                  onPress={() =>
                    props.navigation.navigate("Nautical Warning", {
                      res,
                    })
                  }
                >
                  <H3>{res.properties.locationEn}</H3>
                  <Text>{res.properties.contentsEn}</Text>
                  <Text style={{ fontWeight: "bold" }}>
                    {`Published: ${res.properties.publishingTime.substring(
                      8,
                      10
                    )}.` +
                      `${res.properties.publishingTime.substring(5, 7)}.` +
                      `${res.properties.publishingTime.substring(0, 4)}`}
                  </Text>
                </Callout>
              </Marker>
            );
          }})}
        </MapView>
        <View style={styles.speedometerContainer}>
          <Speedometer
            value={userSpeed * 1.943844}
            totalValue={50}
            showIndicator
            size={150}
            outerColor="#d3d3d3"
            internalColor="#5ADFFF"
            innerColor="#ffffff"
            showText
            text={`${(userSpeed * 1.943844).toFixed(2)} knot`}
            textStyle={{
              color: "#5ADFFF",
              fontSize: 12,
            }}
            showLabels
            labelTextStyle={{
              color: "black",
            }}
            labelFormatter={(number) => `${number}`}
          />
        </View>
        <Fab
          active={active}
          direction="up"
          containerStyle={{ }}
          style={styles.sosFabStyle}
          position="bottomRight"
          onPress={() => sendSosConfirm()}>
          <Icon name="medkit" />
        </Fab>
        <Fab
          active={active}
          direction="up"
          containerStyle={{}}
          style={styles.fabStyle}
          position="bottomLeft"
          onPress={() => setActive(!active)}>
          <Icon name="md-arrow-up" />
          <Button
            style={{
              backgroundColor: "#34A34F",
              marginBottom: 45
            }}
            onPress={() => toggleShipMarkers()}>
            <Icon name="boat" />
          </Button>
          <Button
            style={{
              backgroundColor: "#3B5998",
              marginBottom: 50
            }}
            onPress={() => toggleNauticalWarnings()}>
            <Icon name="warning" />
          </Button>
          <Button
            style={{
              backgroundColor: "#5ADFFF",
              marginBottom: 55
            }}
            onPress={() => toggleFollowUser()}>
              {followUserActive === false ? (
                <Icon name="md-navigate" />
              ) : (
                <Icon color="red" name="md-close" />
              )}
          </Button>
        </Fab>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  mapStyle: {
    ...StyleSheet.absoluteFillObject,
  },

  fabStyle: {
    backgroundColor: "#5ADFFF",
    marginVertical: 30,
  },

  sosFabStyle: {
    backgroundColor: "#f56042",
    marginVertical: 30,
  },

  speedometerContainer: {
    marginVertical: 15,
  },

  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
  },
});

export default MainScreen;
