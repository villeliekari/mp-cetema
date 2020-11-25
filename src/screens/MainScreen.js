import React, {useEffect, useState} from 'react';
import {Container, Button, Icon, Fab} from 'native-base';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {mapStyleDark} from '../styles/MapStyleDark';
import {colors} from '../helpers/GlobalVariables';
import Themes from '../styles/Themes';

import fb from '../helpers/Firebase';

const MainScreen = (props) => {
  const [shipLocations,
    setShipLocations] = useState(null);
  const [shipMetadata,
    setShipMetadata] = useState(null);
  const [userLocations,
    setUserLocations] = useState(null);
  const [shipMarkers,
    setShipMarkers] = useState([]);
  const [userMarkers,
    setUserMarkers] = useState([]);
  const [active,
    setActive] = useState(false);
  const [mapStyle, setMapStyle] = useState(props);
  //const [theme, setTheme]= useState(props);

  //const setMapRef = ref => this.mapRef = ref;

  const fetchData = async() => {
    console.log("Fetching data...")
    const success = res => res.ok
      ? res.json()
      : Promise.resolve({});
    const locations = fetch('https://meri.digitraffic.fi/api/v1/locations/latest').then(success);
    const metadata = fetch('https://meri.digitraffic.fi/api/v1/metadata/vessels').then(success);

    fb
      .database()
      .ref('/userLocations')
      .orderByKey()
      .once('value')
      .then(snap => {
        let userLocationsData = [];
        snap.forEach(childSnap => {
          userLocationsData.push(childSnap.val())
        })
        setUserLocations(userLocationsData);
      });

    try {
      const [locationsFetch,
        metadataFetch] = await Promise.all([locations, metadata]);
      setShipLocations(locationsFetch.features);
      setShipMetadata(metadataFetch);
    } catch (err) {
      return console.log(err);
    }
  }

  const getMarkers = () => {
    if (shipLocations && shipMetadata && userLocations) {
      console.log("Updating markers...")
      const currentTime = Date.now()
      const filterTime = currentTime - 60000
      const combinedResult = shipLocations
        .filter(i => i.properties.timestampExternal >= filterTime)
        .map(locaObj => ({
          ...shipMetadata.find((metaObj) => (metaObj.mmsi === locaObj.mmsi)),
          ...locaObj
        }));

      setShipMarkers(combinedResult);
      setUserMarkers(userLocations);
    }
  }

  const updateUserLocationToFirebase = () => {
    const currentLocationMOCK = {
      coords: {
        latitude: 60.244961,
        longitude: 24.989050,
        heading: 0,
        speed: 30
      }
    }
    fb
      .database()
      .ref(`/userLocations/${fb.auth().currentUser.uid}`)
      .set(currentLocationMOCK)
  }

  //UseEffects
  useEffect(() => {
    fetchData();
    console.log("eka?")
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    updateUserLocationToFirebase();
    getMarkers();
  }, [shipLocations, shipMetadata, userLocations]);

  /*const changeMap = () => {
    console.log("update mapstyle1")
      setMapStyle({ mapStyle: mapStyleDark }, () => {
      console.log("update mapstyle2")
      this.mapRef._updateStyle();      
      console.log("update complete")
    })
  }*/

  return (
    <Container>
      <MapView
        ref={(ref) => mapRef = ref}
        style={{
        flex: 1
      }}
        initialRegion={{
        latitude: 60.1587262,
        longitude: 24.922834,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1
      }}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyleDark}
        showsUserLocation={true}
        showsMyLocationButton={true}>
        {shipMarkers.map((res, i) => {
          return (<Marker
            key={i}
            coordinate={{
            latitude: res.geometry.coordinates[1],
            longitude: res.geometry.coordinates[0]
          }}
            title={res
            .mmsi
            .toString()}
            description={res
            .shipType
            .toString()}
            image={require('../../assets/cargoshipicon.png')}/>);
        })}
        {userMarkers.map((res, i) => {
          return (<Marker
            key={i}
            coordinate={{
            latitude: res.coords.latitude,
            longitude: res.coords.longitude
          }}
            title={"user"}
            image={require('../../assets/usericon.png')}/>);
        })}
      </MapView>
      <Fab
        active={active}
        direction="up"
        containerStyle={{}}
        style={{
        backgroundColor: '#5067FF'
      }}
        position="bottomRight"
        onPress={() => setActive(!active)}>
        <Icon name="share"/>
        <Button style={{
          backgroundColor: '#34A34F'          
        }}
        //onPress={() => changeMap(props)}
        >
          <Icon name="logo-whatsapp"/>
        </Button>
        <Button style={{
          backgroundColor: '#3B5998'
        }}>
          <Icon name="logo-facebook"/>
        </Button>
        <Button style={{
          backgroundColor: '#DD5144'
        }}>
          <Icon name="mail"/>
        </Button>
      </Fab>
    </Container>
  );
}

export default MainScreen;