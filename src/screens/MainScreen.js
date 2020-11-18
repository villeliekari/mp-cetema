import React, { useEffect, useState } from 'react';
import { Container } from 'native-base';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { mapStyleDark } from '../variables/MapStyleDark';

const MainScreen = () => {
  const [shipLocations, setShipLocations] = useState(null);
  const [shipMetadata, setShipMetadata] = useState(null);
  const [markers, setMarkers] = useState([]);

  const fetchData = async () => {
    console.log("Updating fetchdata...")
    const success = res => res.ok ? res.json() : Promise.resolve({});
    const locations = fetch('https://meri.digitraffic.fi/api/v1/locations/latest').then(success);
    const metadata = fetch('https://meri.digitraffic.fi/api/v1/metadata/vessels').then(success);

    try {
      const [locationsFetch, metadataFetch] = await Promise.all([locations, metadata]);
      setShipLocations(locationsFetch.features);
      setShipMetadata(metadataFetch);
    } catch (err) {
      return console.log(err);
    }
  }

  //useEffect for start
  useEffect(() => {
    let mounted = true;
    if (mounted) fetchData();
    return () => mounted = false;
  }, []);

  //useEffect for updating data every X seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  //useEffect for updating markers when data changes
  useEffect(() => {
    mapMarkers();
  }, [shipLocations])

  const mapMarkers = () => {
    if (shipLocations && shipMetadata) {
      console.log("Updating markers...")
      const currentTime = Date.now()
      const filterTime = currentTime - 36000
      const combinedResult = shipLocations.filter(result => result.properties.timestampExternal >= filterTime).map(locaObj => ({
        ...shipMetadata.find((metaObj) => (metaObj.mmsi === locaObj.mmsi)),
        ...locaObj
      }));

      setMarkers(combinedResult);
    }
  }

  return (
    <Container>
      <MapView
        style={{ flex: 1 }}
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
        {markers.map((res, i) => {
          let vesselIcon;
          if (70 <= res.shipType < 90) {
            vesselIcon = require("../../assets/cargoshipicon.png");
          } else if (60 <= res.shipType < 70) {
            vesselIcon = require("../../assets/cruiseicon.png");
          } else {
            vesselIcon = require("../../assets/boaticon.png");
          }

          return (
            <Marker
              key={i}
              coordinate={{
                latitude: res.geometry.coordinates[1],
                longitude: res.geometry.coordinates[0],
              }}
              title={res.mmsi.toString()}
              description={res.shipType.toString()}
              image={vesselIcon} />
          );
        })}
      </MapView>
    </Container>
  );
}

export default MainScreen;