import React from 'react';
import { View, Image } from 'react-native';

import markerImg from '../../../../assets/images/maps/marker_destiny.png';

import styles from './style';

export const CustomMarker = () => {
  return (
    <View style={styles.container}>
      <Image
        source={markerImg}
        style={styles.markerImage}
        resizeMode="contain"
      />
    </View>
  );
};
