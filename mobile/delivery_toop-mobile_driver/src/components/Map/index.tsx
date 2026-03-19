/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useState, useCallback } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/core';

import styles from './styles';

export const Map = ({ origin }: any) => {
  const [region, setRegion] = useState<any>({
    latitude: origin?.latitude || 0,
    longitude: origin?.longitude || 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useFocusEffect(
    useCallback(() => {
      if (origin?.latitude && origin?.latitude) {
        setRegion({
          ...region,
          latitude: origin?.latitude,
          longitude: origin?.longitude,
        });
      }
    }, [origin]),
  );

  const mapViewRef = useRef(null);
  return (
    <MapView
      style={styles.map}
      ref={mapViewRef}
      showsUserLocation={true}
      showsMyLocationButton={false}
      followsUserLocation={true}
      showsPointsOfInterest={true}
      showsCompass={false}
      region={{
        latitude: region.latitude,
        longitude: region.longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      }}
      loadingEnabled
    />
  );
};
