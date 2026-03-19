/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback } from 'react';
import { Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useFocusEffect } from '@react-navigation/core';
import database from '@react-native-firebase/database';
// import * as Progress from 'react-native-progress';
import { StorageClean } from '../../../services/deviceStorage';

import {
  Container,
  TouchConfirm,
  ConfirmTitle,
  Header,
  HeaderBackTouch,
  IconBack,
} from './styles';
import { Colors } from '../../../styles';

/** Components */
import BoardingPlace from './components/boardingPlace';
import WaitingRide from './components/waitingRide';

/** Service */
import { createBooking } from '../../../services/provider/booking/create';
import { updateBooking } from '../../../store/actions/booking';
import {
  bookingAccepted,
  bookingInProgress,
  bookingConcluded,
  bookingCanceled,
  bookinArrivalconfirm,
  pixPaid,
  blockedUser,
  changeRoute,
} from '../../../services/provider/booking/firebaseBooking';

import config from '../../../config';

export const Ride = ({ navigation }: any) => {
  const dispatch: any = useDispatch();
  const route = useRoute<any>();

  const {
    booking,
    user: { user = null },
  }: any = useSelector((state: any) => state);

  const [load, setLoad] = useState(false);
  const [qrCode] = useState(route.params?.qrCode || '');
  const [driver] = useState(route.params?.driver || '');
  const [useWalletBalance] = useState(route.params?.useWalletBalance ?? false);

  useFocusEffect(
    useCallback(() => {
      try {
        if (user && user.passenger && user.passenger._id) {
          console.log('booking?.status', booking?.status);

          if (booking && booking?.status === 'waiting') {
            navigation.navigate('App', {
              screen: 'Ride',
            });
          } else if (booking && booking?.status === 'waiting_pix') {
            navigation.navigate('Pix');
          } else if (
            booking &&
            (booking?.status === 'accepted' ||
              booking?.status === 'in_progress')
          ) {
            navigation.navigate('App', {
              screen: 'RaceAccepted',
            });
          } else if (user && booking && booking?.status === 'canceled') {
            console.log('solicitação cancelada ...');
            navigation.navigate('App', {
              screen: 'Home',
            });
          }
        }
      } catch (err) {
        //
      }
    }, [booking?.status, user?.passenger?._id]),
  );

  // Corrida Aceita
  useFocusEffect(
    useCallback(() => {
      if (user && user.passenger && user?.passenger?._id) {
        database()
          .ref(`${config.FIREBASE_PATH}passenger/${user.passenger._id}`)
          .on('value', async (snapshot: any) => {
            const notify: any = snapshot.val();

            if (notify?.type === 'race-accepted' && notify?.booking) {
              bookingAccepted(user, dispatch, navigation);
            } else if (notify?.type === 'race_inprogres' && notify?.booking) {
              bookingInProgress(user, dispatch, navigation);
            } else if (notify?.type === 'race_concluded' && notify?.booking) {
              bookingConcluded(user, dispatch, navigation, notify);
            } else if (notify?.type === 'race_canceled' && notify?.booking) {
              bookingCanceled(notify, user, dispatch, navigation);
            } else if (notify?.type === 'race_arrival' && notify?.booking) {
              bookinArrivalconfirm(user, dispatch, navigation);
            } else if (notify?.type === 'pix_paid' && notify?.booking) {
              pixPaid(user, dispatch);
            } else if (notify?.type === 'block') {
              blockedUser(user, dispatch, navigation, notify);
            } else if (notify?.type === 'change-route') {
              changeRoute(user, dispatch);
            }
          });
      }

      return () => {
        setLoad(false);
      };
    }, [user?.passenger?._id]),
  );

  const sendBooking = async () => {
    try {
      setLoad(true);

      let paymentMethod: string = 'money';

      if (route.params?.payment && route.params?.payment?.type) {
        paymentMethod = route.params?.payment?.type;
      }

      let destiny: any = [];
      let additionalStops: any = [];

      if (
        booking.additionalStops &&
        Array.isArray(booking.additionalStops) &&
        booking.additionalStops.length > 0
      ) {
        additionalStops = booking.additionalStops.map((item: any) => {
          return {
            address: item?.details?.formatted_address,
            latitude: item?.latitude,
            longitude: item?.longitude,
          };
        });
      }

      destiny = additionalStops.concat([
        {
          address: booking?.destiny?.details?.formatted_address,
          latitude: booking?.destiny?.latitude,
          longitude: booking?.destiny?.longitude,
        },
      ]);

      const payload = {
        passenger: user?.passenger?._id,
        customer: user?._id,
        origin: {
          address: booking?.origin?.details?.formatted_address,
          latitude: booking?.origin?.latitude,
          longitude: booking?.origin?.longitude,
        },
        destiny: destiny,
        additionalStops: additionalStops,
        service: booking?.service?._id,
        price: booking?.service?.price,
        paymentMethod: paymentMethod,
        routeTime: booking?.service?.routeTime,
        distance: booking?.service?.distance,
        tagCost: booking?.service?.tagCost || 0,
        qrCode,
        driver: driver?._id || null,
        useWalletBalance,
        voucher: booking?.service?.voucher?._id,
      };

      // console.log('payload', payload);

      const response = await createBooking(payload);

      if (response.errMessage) {
        setLoad(false);
        return Alert.alert('Solicitação', response?.errMessage);
      }

      await StorageClean('@waitingDriver');

      dispatch(
        updateBooking({
          payload: {
            status: response?.pixQRCode ? 'waiting_pix' : 'waiting',
            booking: response?.booking,
          },
        }),
      );
    } catch (err) {
      setLoad(false);
    }
  };

  return (
    <Container>
      {booking?.status === 'ready_to_ship' ? (
        <Header>
          <HeaderBackTouch
            onPress={() => {
              navigation.navigate('Home', {
                screen: 'Home',
                params: {},
              });
            }}>
            <IconBack name="navigate-before" size={30} color={Colors.BLACK} />
          </HeaderBackTouch>
        </Header>
      ) : null}

      {booking?.origin ? (
        <BoardingPlace booking={booking} origin={booking?.origin} />
      ) : null}

      {booking?.status !== 'waiting' && user?.passenger?._id ? (
        <TouchConfirm onPress={() => sendBooking()} disabled={load}>
          <ConfirmTitle>
            {!load ? (
              'Confirmar local embarque'
            ) : (
              <ActivityIndicator size={'small'} color={'#ffffff'} />
            )}
          </ConfirmTitle>
        </TouchConfirm>
      ) : null}

      {booking?.status === 'waiting' ? <WaitingRide booking={booking} /> : null}
    </Container>
  );
};
