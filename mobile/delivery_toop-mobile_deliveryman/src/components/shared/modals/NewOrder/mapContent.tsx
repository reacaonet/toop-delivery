import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import MapView, {
  PROVIDER_GOOGLE,
  Circle,
  LatLng,
  Marker,
} from 'react-native-maps';

import styles from './styles';
import { Colors } from '../../../../styles';
import mapStyle from './mapaStyle';

interface MapContentProps {
  order: any;
  deliveryCoord: any;
}

const MapContent: React.FC<MapContentProps> = ({ order, deliveryCoord }) => {
  const restaurantCoord: LatLng = {
    latitude: order?.companyLatitude,
    longitude: order?.companyLongitude,
  };

  const userCoord: LatLng = {
    latitude: order?.customerLatitude,
    longitude: order?.customerLongitude,
  };

  const CustomerMarker = (title: string) => (
    <View style={styles.customMarker}>
      <Text>{title}</Text>
    </View>
  );

  return (
    <View style={styles.mapContainer}>
      {deliveryCoord &&
        deliveryCoord.latitude &&
        userCoord &&
        userCoord.latitude &&
        restaurantCoord &&
        restaurantCoord.latitude ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          zoomControlEnabled={true}
          zoomEnabled={true}
          loadingEnabled={true}
          style={styles.map}
          region={{
            latitude: deliveryCoord?.latitude,
            longitude: deliveryCoord?.longitude,
            latitudeDelta: 0.09,
            longitudeDelta: 0.09,
          }}
          customMapStyle={mapStyle}>
          <Marker coordinate={restaurantCoord}>
            {CustomerMarker(order?.companyName || '')}
          </Marker>
          <Circle
            center={restaurantCoord}
            radius={450}
            strokeColor={Colors.WHITE}
            fillColor={'rgba(74, 95, 237, 0.5)'}
          />

          <Marker coordinate={userCoord}>
            <View>{CustomerMarker('Endereço Entrega')}</View>
          </Marker>
          <Circle
            center={userCoord}
            radius={450}
            strokeColor={Colors.WHITE}
            fillColor={'rgba(74, 95, 237, 0.5)'}
          />
        </MapView>
      ) : null}
    </View>
  );
};

export default React.memo(MapContent);
