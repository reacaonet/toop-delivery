import React from 'react';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import { styles, Container } from './styles';

const Map = () => {
  const region = {
    latitude: -16.719308,
    longitude: -49.264909,
    latitudeDelta: 0.00738,
    longitudeDelta: 0.004543,
  };

  return (
    <Container>
      <MapView
        // provider={PROVIDER_GOOGLE}
        scrollEnabled={true}
        style={styles.map}
        region={region}
        showsUserLocation
        rotateEnabled={false}
      />
    </Container>
  );
};

export default Map;
