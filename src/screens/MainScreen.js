import React, { useEffect, useState } from "react";
import { Container, Fab, Button, View, Header, Icon } from "native-base";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Alert } from 'react-native';
import { mapStyleDark } from "../styles/MapStyleDark";
import * as Location from "expo-location";
import * as geofirestore from 'geofirestore';
import * as geokit from 'geokit';

import firebase from "../helpers/Firebase";

const MainScreen = () => {
  const [location, setLocation] = useState(null);
  const [shipLocations, setShipLocations] = useState(null);
  const [shipMetadata, setShipMetadata] = useState(null);
  const [userLocations, setUserLocations] = useState(null);
  const [shipMarkers, setShipMarkers] = useState([]);
  const [userMarkers, setUserMarkers] = useState([]);
  const [active, setActive] = useState(false)

  const fetchData = async () => {
    console.log("Fetching data...");
    const success = (res) => (res.ok ? res.json() : Promise.resolve({}));
    const locations = fetch(
      "https://meri.digitraffic.fi/api/v1/locations/latest"
    ).then(success);
    const metadata = fetch(
      "https://meri.digitraffic.fi/api/v1/metadata/vessels"
    ).then(success);

    firebase.firestore().collection('userLocations').get().then(snap => {
      let array = [];
      snap.forEach(doc => {
        array.push(doc.data());
      });
      setUserLocations(array);
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

  const updateUserLocation = () => {
    if (location) {
      const currentLocation = {
        ...location,
        uid: firebase.auth().currentUser.uid,
        username: firebase.auth().currentUser.displayName,
        //boatname and so on.
      };
      firebase.firestore()
        .collection('userLocations')
        .doc(firebase.auth().currentUser.uid)
        .set(currentLocation, { merge: true })
        .then((doc) => {
          console.log('New Location document added');
        }).catch((error) => {
          console.error('Error adding document: ', error);
        });
    }
  }

  const getUserLocation = async () => {
    console.log("Getting user location...");
    let { status } = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
    }

    let _location = await Location.getCurrentPositionAsync({});
    setLocation(_location);
  };

  const sosAlert = () => {
    Alert.alert(
      'SOS Alert',
      'People nearby will receive your alert',
      [
        { text: 'Rescued', onPress: () => updateSosAlert('rescued') },
        { text: 'Cancel', onPress: () => updateSosAlert('cancel'), style: 'cancel' }
      ],
      { cancelable: false }
    );
  };

  const receiveSosAlert = (data) => {
      console.log("xxxxxxxx", data)
      Alert.alert(
        'SOS Alert',
        data[0].username + ' needs your help',
        [
          { text: 'Ok' },
          { text: 'Cancel', style: 'cancel' }
        ],
        { cancelable: true }
      )
  }

  const updateSosAlert = (option) => {
    if (option == 'rescued') {
      firebase.firestore()
        .collection('sos')
        .doc(firebase.auth().currentUser.uid)
        .update({
          rescued: true,
        })
    } else if (option == 'cancel') {
      firebase.firestore()
        .collection('sos')
        .doc(firebase.auth().currentUser.uid)
        .delete()
        .then(doc => {
          console.log("Document successfully deleted!");
      }).catch(function(error) {
          console.error("Error removing document: ", error);
      })
    }
    console.log('SOS alert updated:', option)
  }

  const sendSosAlert = () => {
    if (location) {
      const coords = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      }
      const geodata = {
        geohash: geokit.hash(coords),
        geopoint: new firebase.firestore.GeoPoint(location.coords.latitude, location.coords.longitude)
      }
      const sosData = {
        g: geodata,
        uid: firebase.auth().currentUser.uid,
        username: firebase.auth().currentUser.displayName,
        rescued: false,
      };
      firebase.firestore()
        .collection('sos')
        .doc(firebase.auth().currentUser.uid)
        .set(sosData, { merge: true })
        .then((doc) => {
          console.log('New SOS document added')
        }).catch((error) => {
          console.error('Error adding document: ', error)
        })
      sosAlert();
    } else {
      Alert.alert("No location found");
    }
  }

  const getSosAlert = () => {
    if (location) {
      const GeoFirestore = geofirestore.initializeApp(firebase.firestore())
      const geocollection = GeoFirestore.collection('sos')
      const query = geocollection.near({ center: new firebase.firestore.GeoPoint(location.coords.latitude, location.coords.longitude), radius: 5 })
      query.where('rescued', '==', false).onSnapshot(snap => {
          let array = []
          snap.forEach(doc => {
            if (doc.exists && doc.id != firebase.auth().currentUser.uid) {
            array.push(doc.data())
          }})
          if (array.length) {
          receiveSosAlert(array)
          }
      })
    }
  }

  //UseEffects
  useEffect(() => {
    fetchData();
    getUserLocation();
    getSosAlert();
    const interval = setInterval(() => {
      fetchData();
      getUserLocation();
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    updateUserLocation();
    getMarkers();
  }, [shipLocations, shipMetadata, userLocations]);

  return (
    <Container>
      <View style={{ flex: 1 }}>
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
          showsUserLocation={true}
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
                description={`${(currentTime - res.properties.timestampExternal) / 1000
                  }s ago, shiptype: ${res.shipType}, ship name: ${res.name}`}
                image={vesselIcon}
              />
            );
          })}
          {userMarkers.map((res, i) => {
            const userIcon =
              res.uid === firebase.auth().currentUser.uid
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
        <View style={{ position: 'absolute', alignSelf: 'flex-end', top: '95%' }}>
          <Fab
            active={active}
            direction="up"
            containerStyle={{}}
            style={{ backgroundColor: '#5067FF' }}
            position="bottomRight"
            onPress={() => sendSosAlert()}>
            <Icon name="medkit" />
          </Fab>
        </View>
      </View>
    </Container>
  );
};

export default MainScreen;
