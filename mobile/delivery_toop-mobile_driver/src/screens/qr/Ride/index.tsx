/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback } from 'react';
import { Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
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
import { ActiverRun } from '../../../services/provider/booking/activeRun';
import { confirmProgress } from '../../../services/provider/booking/confirmProgress';

const Ride = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const route = useRoute<any>();

  const {
    booking,
    authUser: { user = null },
  }: any = useSelector((state: any) => state);

  const [load, setLoad] = useState(false);
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

        if (booking?.status === 'ready_to_ship') {
          dispatch({
            type: 'SET_CONFIGURATION_SAGA',
            payload: {
              statusBar: {
                barStyle: 'dark-content',
                backgroundColor: 'transparent',
                translucent: true,
              },
            },
          });
        } else if (booking?.status !== 'ready_to_ship') {
          dispatch({
            type: 'SET_CONFIGURATION_SAGA',
            payload: {
              statusBar: {
                barStyle: 'light-content',
                backgroundColor: Colors.GRAY_DARK,
                translucent: false,
              },
            },
          });
        }
      } catch (err) {
        //
      }

      return () => {
        dispatch({
          type: 'SET_CONFIGURATION_SAGA',
          payload: {
            statusBar: {
              barStyle: 'light-content',
              backgroundColor: Colors.GRAY_DARK,
              translucent: false,
            },
          },
        });
      };
    }, [booking?.status, user?.passenger?._id]),
  );

  const sendBooking = async () => {
    try {
      setLoad(true);

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
      // console.log('driver', user?._id);
      const payload = {
        origin: {
          address: booking?.origin?.details?.formatted_address,
          latitude: booking?.origin?.latitude,
          longitude: booking?.origin?.longitude,
        },
        destiny: destiny,
        additionalStops: additionalStops,
        service: booking?.service?._id,
        price: booking?.service?.price,
        routeTime: booking?.service?.routeTime,
        distance: booking?.service?.distance,
        tagCost: booking?.service?.tagCost || 0,
        driverId: user?._id,
        useWalletBalance,
        voucher: booking?.service?.voucher?._id,
      };

      const response = await createBooking(payload);

      if (response.errMessage) {
        setLoad(false);
        return Alert.alert(t('rideScreen.request'), response?.errMessage);
      }

      dispatch({
        type: 'UPDATE_BOOKING_SAGA',
        payload: {
          booking: response?.booking,
        },
      });

      ActiverRun(user?._id).then((result: any) => {
        if (result && Array.isArray(result) && result.length > 0) {
          dispatch({
            type: 'UPDATE_BOOKING_SAGA',
            payload: {
              status: result[0].status,
              booking: result,
            },
          });
        } else if (result && Array.isArray(result) && result.length === 0) {
          dispatch({
            type: 'CLEAN_BOOKING_SAGA',
          });
        }
      });

      await confirmProgress({
        driverId: user._id,
        bookingId: response?.booking?._id,
        arrival: false,
      });

      setLoad(false);
      navigation.navigate('DriverMap');
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
              navigation.navigate('QrStack');
            }}>
            <IconBack name="navigate-before" size={30} color={Colors.BLACK} />
          </HeaderBackTouch>
        </Header>
      ) : null}

      {booking?.origin ? (
        <BoardingPlace booking={booking} origin={booking?.origin} />
      ) : null}

      {booking?.status !== 'waiting' ? (
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

export default Ride;
