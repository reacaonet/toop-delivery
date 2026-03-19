/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useCallback, useState} from 'react';
import {Alert, Image, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

/** Service */
import {
  requestCameraPermission,
  requestExternalWritePermission,
} from '../../../services/permissions';

import styles from './styles';

const HeaderSearch = () => {
  const navigation = useNavigation();

  const goFastBoarding = async () => {
    let isCameraPermitted = await requestCameraPermission();
    let isStoragePermitted = await requestExternalWritePermission();

    if (!isCameraPermitted || !isStoragePermitted) {
      return Alert.alert(
        'Permissão',
        'Por favor é necessário aceitar as permissões para utilizar esta funcionalidade',
      );
    }

    return navigation.navigate('RideAndTravelStack', {
      screen: 'AutoBoard',
    });
  };

  return (
    <TouchableOpacity
      style={styles.ButtonImage}
      onPress={() => goFastBoarding()}>
      <View style={styles.ButtonBoard}>
        <Text style={styles.TextButton}>EMBARQUE RÁPIDO</Text>
      </View>
      <Image
        style={styles.imageIcon}
        source={require('../../../assets/images/QR.png')}
      />
    </TouchableOpacity>
  );
};

export default HeaderSearch;
