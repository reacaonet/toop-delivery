/* eslint-disable prettier/prettier */
import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Text, Image, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Modalize } from 'react-native-modalize';
import Geolocation from '@react-native-community/geolocation';
import { useDispatch, useSelector } from 'react-redux';

import SecurityIcon from '../../../../assets/images/security.svg';
import CompassIcon from '../../../../assets/images/compass.svg';

/** Service */
import LocationPermission from '../../../../services/permissions/permissions';

// import Modal from '../../../modalSecurity/components/index';

import { Colors } from '../../../../styles';
import styles from './styles';

import imageWaze from '../../../../assets/images/maps/waze.png';
import imageGoogle from '../../../../assets/images/maps/google_direction.png';
import { t } from 'i18next';

export function MapButtons({
  onPress,
  compass,
  onPressExternalNavigation,
  booking,
  driverLocation,
  originMap,
  setOriginMap,
}: any) {
  const modalRef = useRef<Modalize>(null);
  const dispatch = useDispatch();
  const [load, setLoad] = useState(false);


  const {
    authUser: { user = null },
  }: any = useSelector((state: any) => state);

  const myLocation = async () => {
    setLoad(true);
    await LocationPermission().setPermission();

    Geolocation.getCurrentPosition(
      (result: any) => {
        setLoad(false);

        dispatch({
          type: 'SET_LOCATION_SAGA',
          payload: {
            location: {
              ...result?.coords,
              bearing: result?.coords.heading || null,
            },
            user: user,
          },
          disableUpdate: true,
        });

        if (originMap) {
          setOriginMap({
            latitude: result?.coords.latitude,
            longitude: result?.coords.longitude,
            bearing: result?.coords.heading,
            center: Math.random(),
          });
        }
      },
      (err) => {
        //
        console.log('oops fail location', err);
        setLoad(false);
      },
      {
        timeout: 20000,
        enableHighAccuracy: true,
        maximumAge: 1000,
      },
    );
  };

  return (
    <>
      <Modalize
        ref={modalRef}
        modalStyle={styles.modalStyle}
        childrenStyle={styles.modalChildrenStyle}
        overlayStyle={styles.modalOverlayStyle}
        adjustToContentHeight={false}>
        <Text style={styles.titleNavigation}>{t('navigationDriver.openNavigation')}</Text>
        <View style={styles.containerApp}>
          <TouchableOpacity
            style={styles.contentImg}
            onPress={() => {
              onPressExternalNavigation('waze');
              modalRef.current?.close();
            }}>
            <Image source={imageWaze} style={styles.imgIcon} />
            <Text style={styles.nameApp}>Waze</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contentImg}
            onPress={() => {
              onPressExternalNavigation('google');
              modalRef.current?.close();
            }}>
            <Image source={imageGoogle} style={styles.imgIcon} />
            <Text style={styles.nameApp}>Google</Text>
          </TouchableOpacity>
        </View>
      </Modalize>

      <View style={styles.container}>
        {booking &&
          Array.isArray(booking) &&
          booking.length > 0 &&
          (booking[0].status === 'accepted' ||
            booking[0].status === 'in_progress') && driverLocation?.location ? (
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => modalRef.current?.open()}>
            <Icon name={'navigation'} size={30} color={Colors.BLACK} />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.circleBtn} onPress={() => myLocation()} disabled={load} >
          {!load ? (
            <Icon name="my-location" size={30} color={Colors.BLACK} />
          ) : (
            <ActivityIndicator size="small" color={Colors.BLACK} />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onPress}>
          <SecurityIcon fill={Colors.PRIMARY} />
        </TouchableOpacity>

        <TouchableOpacity onPress={compass}>
          <CompassIcon fill={Colors.PRIMARY} />
        </TouchableOpacity>

        {/*
      <Modal
        animationType='slide'
        visible={modalVisible}
        onPress={() => setModalVisible(!modalVisible)}
      />
      */}
      </View>
    </>
  );
}
