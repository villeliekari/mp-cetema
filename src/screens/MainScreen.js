import React, { useEffect, useState, useContext } from "react";
import { Container, Fab, Button, View, Header, Icon, Text } from "native-base";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Alert, StyleSheet } from "react-native";
import { mapStyleDark, mapStyleLight } from "../styles/MapStyleDark";
import * as Location from "expo-location";
import * as geofirestore from "geofirestore";
import * as geokit from "geokit";
import { withinRadius } from "../helpers/Utility";
import * as Notifications from "expo-notifications";
import ThemeContext from "../helpers/ThemeContext";

import { useTheme } from "@react-navigation/native";

import firebase from "../helpers/Firebase";
import Speedometer from "react-native-speedometer-chart";

const MainScreen = () => {
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

  const [collisionDetected, setCollisionDetected] = useState(false);
  const [userWithinRadius, setUserWithinRadius] = useState([]);

  const { isDarkTheme } = useContext(ThemeContext);

  const GeoFirestore = geofirestore.initializeApp(firebase.firestore());

  const fetchData = async () => {
    console.log("Fetching data...");
    const success = (res) => (res.ok ? res.json() : Promise.resolve({}));
    const locations = fetch(
      "https://meri.digitraffic.fi/api/v1/locations/latest"
    ).then(success);
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

  const getUserMarkers = () => {
    if (location) {
      console.log("Updating user markers...");

      // get user locations in 100km radius and last 1 hour
      // .where can't be used on query because inequality isn't supported
      const filterTime = Date.now() - 3600000;
      const geocollection = GeoFirestore.collection("userLocations");
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
              // set collision alert if not same uid and set radius
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
      const filterTime = Date.now() - 60000;
      const combinedResult = shipLocations
        .filter((i) => i.properties.timestampExternal >= filterTime)
        .map((locaObj) => ({
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
      };

      try {
        // can't be here
        await firebase
          .firestore()
          .collection("userBoats")
          .doc(firebase.auth().currentUser.uid)
          .get()
          .then((res) => {
            locationData.boatName = res.data().boatName;
            locationData.boatType = res.data().boatType;
          })
          .catch((err) => {
            throw new Error(err.message);
          });

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

  useEffect(() => {
    fetchData();
    getUserLocation();
    const interval = setInterval(() => {
      fetchData();
    }, 120000);
    return () => clearInterval(interval);
  }, []);

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
      console.log("setCollisionDetected(true)");
    } else {
      console.log("setCollisionDetected(false)");
      setCollisionDetected(false);
    }
  }, [userWithinRadius]);

  useEffect(() => {
    sendCollisionAlert();
  }, [collisionDetected]);

  useEffect(() => {
    getShipMarkers();
  }, [shipLocations, shipMetadata]);

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
          provider={PROVIDER_GOOGLE}
          customMapStyle={isDarkTheme ? mapStyleDark : mapStyleLight}
          showsUserLocation={true}
          followsUserLocation={true}
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
                //image={vesselIcon}
              />
            );
          })}
          {userMarkers.map((res, i) => {
            //Get only other users markers and use one in mapview for self (showsUserLocation={true})
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
                />
              );
            }
          })}
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
            textStyle={{ color: "#5ADFFF", fontSize: 12 }}
            showLabels
            labelTextStyle={{ color: "black" }}
            labelFormatter={(number) => `${number}`}
          />
        </View>
        <Fab
          active={active}
          direction="up"
          containerStyle={{}}
          style={styles.fabStyle}
          position="bottomRight"
          onPress={() => sendSosAlert()}
        >
          <Icon name="medkit" />
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
    marginVertical: 15,
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
