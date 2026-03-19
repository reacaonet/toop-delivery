import React from 'react';
import MapViewDirections from 'react-native-maps-directions';
import config from '../../config';

import { Colors } from '../../styles';

export function Directions({
  destination,
  origin,
  onReady,
  additionalStops,
}: any) {
  return (
    <MapViewDirections
      destination={destination}
      origin={origin}
      onReady={onReady}
      apikey={config.apiGeoLocation}
      waypoints={additionalStops}
      optimizeWaypoints={true}
      strokeWidth={3}
      strokeColor={Colors.GREY}
      resetOnChange={false}
      mode={'DRIVING'}
      precision={'high'}
    />
  );
}
