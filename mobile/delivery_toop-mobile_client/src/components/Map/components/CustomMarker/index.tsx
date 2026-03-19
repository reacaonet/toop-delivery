import React from 'react';
import { View, Image } from 'react-native';

import markerImg from '../../../../assets/images/map/marker_destiny.png';

import styles from './style';

const CustomMarker = ({ image }: any) => {
  return (
    <View style={styles.container}>
      <Image
        source={image ? image : markerImg}
        style={styles.markerImage}
        resizeMode="contain"
      />
    </View>
  );
};

export default CustomMarker;
