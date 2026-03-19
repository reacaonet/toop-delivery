/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState, memo } from 'react';
import { Dimensions, Alert } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useDispatch, useSelector } from 'react-redux';
import database from '@react-native-firebase/database';
import * as Progress from 'react-native-progress';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import {
  styles,
  Container,
  Title,
  ContentInfo,
  PriceTxt,
  KMTxt,
  Options,
  AcceptBtn,
  TitleAccept,
  RefuseBtn,
  TitleRefuse,
  ContainerAddress,
  ContainerPassenger,
  PassengerPhoto,
  PassengerInfo,
  PassengerName,
  PassengerTextAdditional,
  ContainerIconAddress,
  ContainderTextAddress,
  TextAdressUp,
} from './styles';
import { Colors } from '../../styles';

import config from '../../config/index';
import { formatMoney, round } from '../../utils';

import { navigate } from '../../navigations/rootNavigation';

/** Service */
import { acceptRace } from '../../services/provider/booking/acceptRace';
import { ActiverRun } from '../../services/provider/booking/activeRun';
import { refusedBooking } from '../../services/provider/booking/cancel';
import { startSoundNotification, stopSound } from '../../services/TrackPlayer/soundNotification';

/** Images */

const NewRace = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const modalizeRef = useRef<Modalize>(null);
  const [width, setWidth] = useState(0);
  const [newBooking, setNewBooking]: any = useState(null);
  const time = useRef<any>(null);
  const [load, setLoad] = useState(false);

  const {
    authUser: { user = null },
    booking,
    configurations = null,
  }: any = useSelector((state: any) => state);

  const height = Dimensions.get('window').height;

  useEffect(() => {
    if (user && user._id) {
      // console.log('booking', `${config.FIREBASE_PATH}booking/driver/${user._id}`);
      database()
        .ref(`${config.FIREBASE_PATH}booking/driver/${user._id}`)
        .on('value', async (snapshot: any) => {
          const notify: any = snapshot.val();
          // console.log('notify', notify);

          if (notify) {
            let sentDate = notify?.sentDate;
            if (!sentDate) {
              return;
            }

            startSoundNotification();
            modalizeRef.current?.open();
            setNewBooking(notify);
            setWidth(height);
          } else {
            stopSound();
            modalizeRef.current?.close();
            setNewBooking(null);
            setWidth(0);
          }
        });
    }
  }, [user?._id]);

  useEffect(() => {
    if (user && user?._id && booking?.status) {
      // console.log('booking', booking);
    }
  }, [booking?.status, user?._id]);

  const removeNotification = async () => {
    database()
      .ref(`${config.FIREBASE_PATH}booking/driver/${user._id}`)
      .remove();
  };

  const refusedClick = async () => {
    stopSound();
    modalizeRef.current?.close();
    removeNotification();

    refusedBooking(
      newBooking.bookingId,
      user?._id,
    );
  };

  const acceptRaceClick = async () => {
    setLoad(true);
    stopSound();

    const response: any = await acceptRace({
      driverId: user?._id,
      bookingId: newBooking.bookingId,
    });

    if (response && response.errMessage) {
      setLoad(false);
      return Alert.alert('Nova Solicitação', response?.errMessage || '');
    }

    setLoad(false);
    modalizeRef.current?.close();
    removeNotification();

    ActiverRun(user?._id).then((result: any) => {
      if (result && Array.isArray(result) && result.length > 0) {
        dispatch({
          type: 'UPDATE_BOOKING_SAGA',
          payload: {
            status: result[0].status,
            booking: result,
          },
        });

        cleanTime();
        navigate('Notification', {});
      } else {
        cleanTime();
        navigate('Notification', {});
      }
    });

    time.current = setTimeout(() => {
      navigate('Notification', {});
    }, 3000);
  };

  const cleanTime = () => {
    try {
      if (time.current) {
        clearTimeout(time.current);
        time.current = null;
      }
    } catch (err) {
      //
    }
  };

  return (
    <>
      <Modalize
        ref={modalizeRef}
        alwaysOpen={width}
        modalStyle={styles.modalStyle}
        childrenStyle={styles.modalChildrenStyle}
        overlayStyle={styles.modalOverlay}
        adjustToContentHeight={false}>

        <Container>
          <ContentInfo>
            <KMTxt>
              {newBooking?.service || '-'}
            </KMTxt>
            <PriceTxt>{formatMoney(newBooking?.price || 0, configurations?.coin)}</PriceTxt>
          </ContentInfo>

          <ContainerAddress>
            <ContainerIconAddress>
              <Icon name="arrow-circle-up" size={25} color={Colors.SUCCESS} />
            </ContainerIconAddress>
            <ContainderTextAddress>
              <TextAdressUp>{newBooking?.routeTimePassenger} ● {newBooking?.distancePassenger}</TextAdressUp>
              <Title numberOfLines={2} >{newBooking?.address}</Title>
            </ContainderTextAddress>
          </ContainerAddress>

          <ContainerAddress>
            <ContainerIconAddress>
              <Icon name="arrow-circle-down" size={25} color={Colors.WARNING} />
            </ContainerIconAddress>

            <ContainderTextAddress>
              <TextAdressUp>{newBooking?.routeTime || ''} ● {newBooking?.distance || ''}</TextAdressUp>
              <Title numberOfLines={2} >{newBooking?.addressDestiny}</Title>
            </ContainderTextAddress>
          </ContainerAddress>

          <ContainerPassenger>
            {newBooking?.passengerImage &&
              newBooking?.passengerImage.length > 0 ? (
              <PassengerPhoto
                source={{ uri: newBooking?.passengerImage }}
                resizeMode={'contain'}
              />
            ) : (
              <PassengerPhoto source={require('../../assets/images/photo.png')} />
            )}
            <PassengerInfo>
              <PassengerName numberOfLines={1} >{newBooking?.passengerName}</PassengerName>
              <PassengerTextAdditional>
                {newBooking?.passengerStars ? `★ ${round(newBooking?.passengerStars, 2)}` : ''}
                {newBooking?.passengerCpf ? ` ● CPF ${newBooking?.passengerCpf}` : ''}
              </PassengerTextAdditional>
            </PassengerInfo>
          </ContainerPassenger>

          <Options>
            <RefuseBtn onPress={() => refusedClick()}>
              <TitleRefuse>Recusar</TitleRefuse>
            </RefuseBtn>
            <AcceptBtn onPress={() => acceptRaceClick()}>
              <TitleAccept>Aceitar</TitleAccept>
            </AcceptBtn>
          </Options>
          <Progress.Bar
            indeterminate={true}
            style={styles.progressBar}
            color={Colors.PRIMARY}
            width={Dimensions.get('window').width - 20}
            useNativeDriver={true}
            animationType={'spring'}
          />
        </Container>
      </Modalize>
    </>
  );
};

export default memo(NewRace);
