/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import MapFastBoarding from '../../../components/MapFastBoarding';
import {
  useRoute,
  useNavigation,
} from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { decode } from '@googlemaps/polyline-codec';


import carEconomyImg from '../../../assets/images/car-economy.png';

/** Styles */
import styles from './styles';

/** Util */
import { formatMoney } from '../../../utils';

/** Images */
import imageOrigin from '../../../assets/images/maps/origin.png';
import imageDestiny from '../../../assets/images/maps/destiny.png';

const ConfirmRide = () => {
  const dispatch = useDispatch();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const {
    booking,
  }: any = useSelector((state: any) => state);

  const [selectService] = useState(route.params?.selectService || {});
  const [methodCurrent, setMethodCurrent] = useState<any>(null);
  const [qrCode] = useState(route.params?.qrCode || '');
  const [driver] = useState(route.params?.driver || '');

  const [useWalletBallance, setUseWalletBallance] = useState(false);

  const onPressNext = () => {
    dispatch({
      type: 'UPDATE_BOOKING_SAGA',
      payload: {
        status: 'ready_to_ship',
      },
    });

    navigation.navigate('Ride', {
      chosenOrigin: route.params.chosenOrigin,
      chosenDestination: route.params.chosenDestination,
      additionalStops: route.params.additionalStops,
      selectService: selectService,
      payment: methodCurrent,
      qrCode,
      driver,
      useWalletBalance: useWalletBallance,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.map}>
        <MapFastBoarding
          chosenOrigin={route.params.chosenOrigin}
          chosenDestination={route.params.chosenDestination}
          additionalStops={route.params.additionalStops}
          imageOrigin={imageOrigin}
          imageDestiny={imageDestiny}
          overviewPolyline={
            route.params?.selectService?.overviewPolyline?.points
              ? decode(
                route.params?.selectService?.overviewPolyline?.points,
              ).map(item => {
                return {
                  latitude: item[0],
                  longitude: item[1],
                };
              })
              : null
          }
        />
      </View>

      <View style={styles.rideInfo}>
        <View style={styles.rideView}>
          {booking?.service?.price ? (
            <>
              {booking?.service?.voucher?.priceWithVoucher ? (
                <Text style={styles.price}>
                  {formatMoney(booking?.service?.voucher?.priceWithVoucher)}
                </Text>
              ) : (
                <Text style={styles.price}>
                  {formatMoney(booking?.service?.price)}
                </Text>
              )}
            </>
          ) : null}
          <Text style={styles.ride}>{booking?.service?.name}</Text>
          <Text style={styles.duration}>{booking?.service?.routeTime}</Text>
          {selectService && selectService?.onlyForWomen === true ? (
            <Text style={styles.duration}>
              Somente para mulheres
            </Text>
          ) : null}
        </View>

        {selectService?.images &&
          Array.isArray(selectService?.images) &&
          selectService?.images.length ? (
          <Image
            source={{
              uri: selectService?.images[0],
            }}
            style={{ width: 50, height: 50 }}
            resizeMode="contain"
          />
        ) : (
          <Image source={carEconomyImg} />
        )}
      </View>

      {booking?.service?.price ? (
        <View style={styles.confirmButtonContainer}>
          <TouchableOpacity
            onPress={() => onPressNext()}
            style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Confirmar viagem</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

export default ConfirmRide;
