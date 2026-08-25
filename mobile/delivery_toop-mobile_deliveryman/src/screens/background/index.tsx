/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import {View, Text, Image} from 'react-native';
import styles from './styles';

interface BackgroundProps {
  // navigation: any;
}

const Background: React.FC<BackgroundProps> = ({}) => {
  const logo = require('../../assets/images/logo_splash.png');

  useEffect(() => {
    return () => {};
  }, []);

  return (
    <View style={styles.content}>
      <View style={[styles.container]}>
        <View>
          <Text style={styles.title}>GojáDelivery</Text>
        </View>
        <View style={styles.imgContent}>
          <Image style={styles.logo} resizeMode="contain" source={logo} />
        </View>
      </View>
    </View>
  );
};

export default Background;
