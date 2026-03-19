/* eslint-disable react-hooks/exhaustive-deps */
import React, { FunctionComponent, useCallback, useEffect } from 'react';
import { View, StyleSheet, Image, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import isAuthenticated from '../../services/userAuth';
import Permission from '../../services/permissions/locationPermission';
import NetInfo from '@react-native-community/netinfo';

type SplashProps = {
  navigation: any;
};

const Splash: FunctionComponent<SplashProps> = ({ navigation }: SplashProps) => {
  const logo = require('../../assets/images/logo_splash.png');

  useEffect(() => {
    navigation.closeDrawer();
    isUser();
  }, []);

  const isUser = async () => {
    const isAuth = await isAuthenticated();
    setTimeout(() => {
      if (!isAuth) {
        navigation.navigate('LocationPermition');
      }
    }, 500);
  };

  return (
    <View style={styles.container}>
      <Image style={styles.logo} resizeMode="contain" source={logo} />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  header: {
    flex: 1,
  },
  logo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: Platform.OS === 'android' ? 200 : 400,
  },
  footer: {
    flex: 1,
  },
});
