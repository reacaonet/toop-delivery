/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  StatusBar,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/core';

import styles from './styles';

import NotificationPermission from '../../../services/permissions/notifications';

const Notification = ({ navigation }: any) => {
  const [show, setShow] = useState<boolean>(false);
  const logo = require('../../../assets/images/logo.png');
  // const notification = require('./images/notification.png');

  useFocusEffect(
    useCallback(() => {
      checkPermission();
    }, []),
  );

  const checkPermission = async () => {
    try {
      let isPermission = await NotificationPermission().isPermission();
      if (isPermission) {
        next();
        // setShow(true);
      } else {
        setShow(true);
      }
    } catch (err) {
      //
    }
  };

  const acceptPermission = async () => {
    try {
      let isPermission: boolean = true;
      isPermission = await NotificationPermission().isPermission();

      if (isPermission === true) {
        next();
        return;
      }

      if (Platform.OS === 'ios') {
        isPermission = await NotificationPermission().requestPermissionIOS();
      } else {
        isPermission =
          await NotificationPermission().requestPermissionANDROID();
      }

      if (isPermission) {
        next();
        return;
      }

      Linking.openSettings();
    } catch (err) {
      console.log('Error acceptPermission', err);
    }
  };

  const next = () => {
    navigation.navigate('LocationPermition');
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      {!show ? (
        <View style={styles.containerShow}>
          <Image style={styles.logoShow} resizeMode="contain" source={logo} />
        </View>
      ) : (
        <>
          <StatusBar barStyle={'dark-content'} />
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
            }}>
            <View style={styles.container}>
              <Text style={styles.title}>SEJA BEM-VINDO</Text>
              <Text style={styles.title}>Economize tempo e dinheiro</Text>
              {/* <View style={styles.icon}>
                <Image source={notification} />
              </View> */}
              <Text style={styles.titlePermition}>Permitir Notificações</Text>
              <Text style={styles.descricao}>
                Receba notificações de corridas e alertas e novas informações
              </Text>
            </View>
          </ScrollView>
          <View style={styles.BoxFooter}>
            <TouchableOpacity style={styles.btn} onPress={() => next()}>
              <Text style={styles.btnText}>Pular</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => acceptPermission()}>
              <Text style={[styles.btnText, styles.btnTextPrimary]}>
                Permitir
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default Notification;
