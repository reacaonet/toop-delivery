/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useRef } from 'react';
import MapView from 'react-native-maps';
import { useDispatch } from 'react-redux';

/** Styles */
import { styles, Container, ContentMarker } from './styles';

/** Components */
import { CustomMarker } from '../../../../../components/Map/components/CustomMarker';

const BoardingPlace = ({ origin, booking }: any) => {
  const dispatch = useDispatch();
  const touchMove = useRef(false);

  const mapViewRef = useRef<any>(null);
  const [region, setRegion] = useState<any>({
    latitude: origin.latitude,
    longitude: origin.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const changeCoordinate = (coords: any) => {
    if (touchMove.current === false || booking?.status === 'waiting') {
      return;
    }

    if (
      parseFloat(origin.latitude) === parseFloat(coords.latitude) &&
      parseFloat(origin.longitude) === parseFloat(coords.longitude)
    ) {
      return;
    }

    booking.origin.latitude = coords.latitude;
    booking.origin.longitude = coords.longitude;
    touchMove.current = false;

    setRegion({
      ...region,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    dispatch({
      type: 'UPDATE_BOOKING_SAGA',
      payload: {
        ...booking,
        status: 'ready_to_ship',
      },
    });
  };

  return (
    <Container>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        loadingEnabled
        zoomControlEnabled={true}
        zoomEnabled={true}
        ref={mapViewRef}
        rotateEnabled={false}
        onRegionChangeComplete={coords => {
          changeCoordinate(coords);
        }}
        onTouchMove={() => {
          if (touchMove.current === false) {
            touchMove.current = true;
          }
        }}
      />

      <ContentMarker pointerEvents={'none'}>
        <CustomMarker />
      </ContentMarker>
    </Container>
  );
};

export default BoardingPlace;
