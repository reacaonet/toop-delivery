import React from 'react';
import MapViewDirections from 'react-native-maps-directions';
import config from '../../config';

import {Colors} from '../../styles';

export function Directions({destination, origin, onReady, waypoints}) {
  return (
    <MapViewDirections
      destination={destination}
      origin={origin}
      onReady={onReady}
      apikey={config.apiGeoLocation}
      strokeWidth={3}
      strokeColor={Colors.GREY}
      resetOnChange={false}
      mode={'DRIVING'}
      waypoints={waypoints}
      optimizeWaypoints={true}
    />
  );
}
