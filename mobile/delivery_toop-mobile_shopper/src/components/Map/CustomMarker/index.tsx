import React from 'react';
import { View, Image } from 'react-native';

import markerImg from '../../../assets/images/location.png';

import styles from './style';

const CustomMarker = () => {
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

export default CustomMarker;
