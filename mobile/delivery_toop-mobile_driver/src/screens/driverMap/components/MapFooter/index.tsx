/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Linking,
  DeviceEventEmitter,
  NativeModules,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/core';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import database from '@react-native-firebase/database';
import { useTranslation } from 'react-i18next';
const { OpenApp } = NativeModules;

import ServicesIcon from '../../../../assets/images/services.svg';
import DestinyIcon from '../../../../assets/images/destiny.svg';

import styles from './styles';
import { Colors } from '../../../../styles';

/** Service */
import { updateDriver } from '../../../../services/provider/user/update';
import { confirmProgress } from '../../../../services/provider/booking/confirmProgress';
import { ActiverRun } from '../../../../services/provider/booking/activeRun';
import { completeRace } from '../../../../services/provider/booking/complete';
import {
  StorageGet,
  StorageClean,
  StorageSet,
} from '../../../../services/deviceStorage';
import {
  bookingEvaluation,
  bookingCanceled,
  blockedUser,
  changeRoute,
} from '../../../../services/provider/booking/firebaseBooking';
import {
  stopBackground,
  updateBackground,
  startLocationNative,
} from '../../../../services/Background/backgroundActions';

import { timeConvert } from '../../../../utils';

import config from '../../../../config';

/** Image */
import phoneIcon from '../../../../assets/images/phone.png';
import chatIcon from '../../../../assets/images/chat.png';

export function MapFooter({
  onPress,
  destiny,
  services,
  booking,
  distance,
  time,
  timeToEnd,
}: any) {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [timeWating, setTimeWating] = useState('04:59');

  const {
    authUser: { user = null },
  }: any = useSelector((state: any) => state);

  const { t } = useTranslation();

  const [load, setLoad] = useState(false);
  const [newMessage, setNewMessage] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isFocusCodeInput, setIsFocusCodeInput] = useState(false);
  const attempts = useRef(0);

  useFocusEffect(
    useCallback(() => {
      let interval: any = null;

      try {
        if (
          booking &&
          Array.isArray(booking) &&
          booking.length > 0 &&
          booking[0].status === 'accepted' &&
          booking[0]?.arrivedLocal === true
        ) {
          StorageGet('@waitingPassenger').then(resp => {
            let dataCurrent: any = moment().utc(false).format();

            if (!resp || resp === null) {
              StorageSet('@waitingPassenger', dataCurrent);
            } else {
              dataCurrent = resp;
            }

            interval = setInterval(() => {
              dataCurrent = moment(dataCurrent).utc(false);
              let diff = moment.utc(moment().diff(moment(dataCurrent)));

              let minutes: number = Number(diff.format('mm'));
              let seconds: number = Number(diff.format('ss'));

              if (minutes < 5) {
                let minutesDiff = 4 - minutes;
                let secondsDiff = 59 - seconds;
                setTimeWating(
                  `${`${minutesDiff}`.padStart(
                    2,
                    '0',
                  )}:${`${secondsDiff}`.padStart(2, '0')}`,
                );
              } else {
                setTimeWating('00:00');
                clearInterval(interval);
                interval = null;
              }
            }, 1000);
          });
        }
      } catch (err) { }

      return () => {
        if (interval) {
          clearInterval(interval);
        }
        interval = null;
      };
    }, [booking]),
  );

  // Update Booking
  useFocusEffect(
    useCallback(() => {
      let notifyDriver: any = null;
      attempts.current = 0;

      getBooking();
      if (user?._id) {
        notifyDriver = database()
          .ref(`${config.FIREBASE_PATH}driver/${user?._id}`)
          .on('value', async snapshot => {
            try {
              const respNotify = snapshot.val();

              if (
                respNotify?.type === 'race_concluded' &&
                respNotify?.booking
              ) {
                bookingEvaluation(
                  user,
                  respNotify,
                  dispatch,
                  navigation.navigate,
                );
              } else if (
                respNotify?.type === 'race_canceled' &&
                respNotify?.booking
              ) {
                bookingCanceled(user, dispatch, navigation.navigate);
              } else if (respNotify?.type === 'block') {
                blockedUser(user, dispatch, navigation.navigate, respNotify);
              } else if (respNotify?.type === 'change-route') {
                changeRoute(user, respNotify, dispatch, navigation.navigate);
              }
            } catch (_err) {
              //
            }
          });
      }

      return () => {
        if (notifyDriver && user?._id) {
          database()
            .ref(`${config.FIREBASE_PATH}driver/${user?._id}`)
            .off('value', notifyDriver);
        }
      };
    }, [user?._id]),
  );

  // Messages
  useFocusEffect(
    useCallback(() => {
      let updateMessage: any = null;

      if (
        booking &&
        Array.isArray(booking) &&
        booking.length > 0 &&
        booking[0]._id
      ) {
        updateMessage = database()
          .ref(`${config.FIREBASE_PATH}chatRace/${booking[0]._id}`)
          .on('value', snapshot => {
            var value = snapshot.val();
            if (value && value.sent && value.sent === 'passenger') {
              setNewMessage(true);
            } else {
              setNewMessage(false);
            }
          });
      }

      return () => {
        if (
          updateMessage &&
          booking &&
          Array.isArray(booking) &&
          booking.length > 0 &&
          booking[0]._id
        ) {
          database()
            .ref(`${config.FIREBASE_PATH}chatRace/${booking[0]._id}`)
            .off('value', updateMessage);
        }
      };
    }, [booking]),
  );

  const getBooking = async (): Promise<any> => {
    try {
      if (!user?._id || attempts.current > 5) {
        return;
      }

      const result = await ActiverRun(user?._id);

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
      } else {
        attempts.current++;
        return await getBooking();
      }
    } catch (err) {
      attempts.current++;
      return await getBooking();
    }
  };

  const changeStatus = async () => {
    setLoad(true);
    user.online = !user.online;

    const response = await updateDriver(user?._id, {
      online: user.online,
    });

    if (response && response.errMessage) {
      return Alert.alert('Atualizar', response.errMessage || '');
    }

    if (Platform.OS === 'android') {
      DeviceEventEmitter.removeAllListeners('onSessionLocation');
    }

    if (user.online === true) {
      if (Platform.OS === 'android') {
        DeviceEventEmitter.addListener('onSessionLocation', (e: any) => {
          if (e != null) {
            startLocationNative(e);
          }
        });

        OpenApp.updateTimeLocation(false, 0);
        OpenApp.startLocation();
      } else {
        updateBackground();
      }
    } else if (user.online === false) {
      stopBackground();
    }

    dispatch({
      type: 'SET_USER_SAGA',
      payload: user,
    });
    setLoad(false);
  };

  const startRace = async (isArrival = false) => {
    setLoad(true);
    await StorageClean('@waitingPassenger');

    const response: any = await confirmProgress({
      driverId: user._id,
      bookingId: booking[0]._id,
      arrival: isArrival,
    });
    setLoad(false);

    if (response && response.errMessage) {
      return Alert.alert(`Iniciar ${t('races')}`, response.errMessage || '');
    }

    getBooking();
  };

  // Paradas Adicionais
  const arrivedStops = async () => {
    setLoad(true);
    const response: any = await confirmProgress({
      driverId: user._id,
      bookingId: booking[0]._id,
      arrivedStops: booking[0].arrivedStops || 0,
    });
    setLoad(false);

    if (response && response.errMessage) {
      return Alert.alert(`Iniciar ${t('races')}`, response.errMessage || '');
    }

    getBooking();
  };

  const finish = async () => {
    setLoad(true);
    const response: any = await completeRace({
      driverId: user._id,
      bookingId: booking[0]._id,
      confirmationCode,
    });

    if (response && response.errMessage) {
      setLoad(false);
      return Alert.alert(`Iniciar ${t('races')}`, response.errMessage || '');
    }

    await StorageClean('@waitingPassenger');
    //getBooking();
    // enviar para avaliação navigation.navigate('EvaluationScreen');
  };

  const getFirstName = (name: string) => {
    if (!name) {
      return '';
    }
    return name.split(' ')[0].toUpperCase();
  };

  const linkMakeCall = (phone: string) => {
    try {
      if (!phone) {
        return;
      }

      let phonStr = `${phone}`.match(/[0-9]/g)?.join('');
      phonStr = `+${phone}`;

      Linking.openURL(`tel:${phonStr}`);
    } catch (err) {
      console.log('err', err);
    }
  };

  const distanceFormat = (dist: number) => {
    if (dist > 1000) {
      return `${(Number(dist) / 1000).toFixed(1)} km`;
    } else {
      return `${dist} m`;
    }
  };

  return (
    <>
      {booking &&
        Array.isArray(booking) &&
        booking.length > 0 &&
        booking[0]?.franchise?.showPhoneRace?.passenger === true ? (
        <View style={styles.contentPassenger}>
          <Text style={styles.passengerName} numberOfLines={1}>
            {booking[0]?.passenger?.person?.name}
          </Text>
          <TouchableOpacity
            style={styles.contentPhone}
            onPress={() => linkMakeCall(booking[0]?.passenger?.person?.phone)}>
            {/* <Text style={styles.passengerPhone}>{t('phone')}: {booking[0]?.passenger?.person?.phone}</Text> */}
            <Image
              source={phoneIcon}
              style={styles.phoneImage}
              resizeMode={'contain'}
            />
          </TouchableOpacity>
        </View>
      ) : null}

      {booking &&
        Array.isArray(booking) &&
        booking.length > 0 &&
        booking[0].status === 'accepted' &&
        booking[0]?.arrivedLocal !== true ? (
        <View style={styles.containerOptions}>
          <View>
            {distance && distance > 100 ? (
              <Text style={styles.timeDistanceDestiny}>
                {t('navigationDriver.board')}: {time} ({distanceFormat(distance)})
              </Text>
            ) : distance ? (
              <Text style={styles.timeDistanceDestiny}>
                {t('navigationDriver.arrived')}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      {booking &&
        Array.isArray(booking) &&
        booking.length > 0 &&
        booking[0].status === 'accepted' ? (
        <View style={styles.containerOptionsPassenger}>
          <View style={styles.waitingOptionsPassenger}>
            <Text style={styles.timeDistanceDestinyPassenger}>
              Aguardando passageiro
            </Text>
            <View style={styles.time}>
              {/* <Icon name="watch-later" size={18} color={Colors.PRIMARY} /> */}
              <Text style={styles.timeDistanceDestiny}>{timeWating}</Text>
            </View>
            <View style={styles.containerPassenger}>
              {booking &&
                Array.isArray(booking) &&
                booking.length > 0 &&
                (booking[0].status === 'accepted' ||
                  booking[0].status === 'in_progress') ? (
                <TouchableOpacity
                  style={styles.viewMessage}
                  onPress={() => {
                    navigation.navigate('Conversation', {
                      booking: booking[0]._id,
                      goBack: 'DriverMap',
                    });
                  }}>
                  {newMessage ? <Text style={styles.noticeText}>1</Text> : null}
                  <Icon name={'chat-bubble'} size={25} color={Colors.PRIMARY} />
                </TouchableOpacity>
              ) : null}

              <Text style={styles.txtPassengerName}>
                {getFirstName(booking[0]?.passenger?.person?.name)}
              </Text>

              {booking &&
                Array.isArray(booking) &&
                booking.length > 0 &&
                (booking[0].status === 'accepted' ||
                  booking[0].status === 'in_progress') ? (
                <TouchableOpacity
                  style={styles.viewMessage}
                  onPress={() => {
                    navigation.navigate('CancelBooking', {
                      booking: booking[0]._id,
                      goBack: 'DriverMap',
                    });
                  }}>
                  <Icon name="cancel" size={25} color={Colors.PRIMARY} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      ) : null}

      {booking &&
        Array.isArray(booking) &&
        booking.length > 0 &&
        booking[0].status === 'in_progress' ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'position' : 'height'}
          style={{
            ...styles.containerOptions,
            paddingBottom: isFocusCodeInput ? 50 : 0,
          }}>
          <View style={styles.waitingOptions}>
            {distance && distance <= 0.07 && time ? (
              <Text
                style={{
                  ...styles.timeDistanceDestiny,
                  color: isFocusCodeInput ? 'transparent' : Colors.PRIMARY,
                }}>
                Você chegou ao destino
              </Text>
            ) : (
              <Text
                style={{
                  ...styles.timeDistanceDestiny,
                  color: isFocusCodeInput ? 'transparent' : Colors.PRIMARY,
                }}>
                {timeToEnd > 0
                  ? `${(Number(timeToEnd) / 60).toFixed(0)} ${t(
                    'mapFooter.toDestination',
                  )} (${distanceFormat(distance)})`
                  : `${t('races')} ${t('mapFooter.inProgress')}`}
              </Text>
            )}
          </View>
          {(!booking[0].additionalStops ||
            !Array.isArray(booking[0].additionalStops) ||
            booking[0].additionalStops.length === booking[0].arrivedStops) &&
            booking[0].confirmationCode ? (
            <TextInput
              placeholder="Digite o código de confirmação"
              placeholderTextColor={Colors.GRAY_TEXT}
              style={styles.inputConfirmationCode}
              value={confirmationCode}
              keyboardType="number-pad"
              onChangeText={text => setConfirmationCode(text)}
              returnKeyType="done"
              onFocus={() => setIsFocusCodeInput(true)}
              onBlur={() => setIsFocusCodeInput(false)}
            />
          ) : null}
        </KeyboardAvoidingView>
      ) : null}

      <View style={styles.container}>
        <TouchableOpacity style={styles.sideOption} onPress={services}>
          <ServicesIcon />
          <Text style={styles.optionText}>SERVIÇOS</Text>
        </TouchableOpacity>

        {!booking || booking.length <= 0 ? (
          <TouchableOpacity
            style={[
              styles.goOnlineButton,
              user?.online === false
                ? styles.goOfflineButton
                : styles.goOnButton,
            ]}
            onPress={changeStatus}
            disabled={load}>
            {!load ? (
              <Text style={styles.goOnlineButtonText}>
                {user?.online === true
                  ? `${t('mapFooter.online')}`
                  : `${t('mapFooter.offline')}`}
              </Text>
            ) : (
              <ActivityIndicator size={'small'} color={Colors.WHITE} />
            )}
          </TouchableOpacity>
        ) : null}

        {booking &&
          Array.isArray(booking) &&
          booking.length > 0 &&
          booking[0].status === 'accepted' &&
          booking[0]?.arrivedLocal !== true ? (
          <TouchableOpacity
            style={styles.goOnlineButton}
            onPress={() => {
              startRace(true);
            }}
            disabled={load}>
            {!load ? (
              <Text style={styles.goOnlineButtonText}>CHEGUEI NO LOCAL</Text>
            ) : (
              <ActivityIndicator size={'small'} color={Colors.WHITE} />
            )}
          </TouchableOpacity>
        ) : null}

        {booking &&
          Array.isArray(booking) &&
          booking.length > 0 &&
          booking[0].status === 'accepted' &&
          booking[0]?.arrivedLocal === true ? (
          <View style={[styles.viewNoOptions]}>
            <TouchableOpacity
              style={styles.goStartButton}
              onPress={() => startRace()}
              disabled={load}>
              {!load ? (
                <>
                  <Icon
                    style={{ position: 'absolute', left: 10 }}
                    name="arrow-forward"
                    size={20}
                    color={Colors.WHITE}
                  />
                  <Text style={styles.goOnlineButtonText}>
                    INICIAR {t('races')}
                  </Text>
                </>
              ) : (
                <ActivityIndicator size={'small'} color={Colors.WHITE} />
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        {/** Finalizar */}
        {booking &&
          Array.isArray(booking) &&
          booking.length > 0 &&
          booking[0].status === 'in_progress' &&
          (!booking[0].additionalStops ||
            !Array.isArray(booking[0].additionalStops) ||
            booking[0].additionalStops.length === booking[0].arrivedStops) ? (
          <TouchableOpacity
            style={styles.goOnlineButton}
            onPress={() => finish()}
            disabled={load}>
            {!load ? (
              <Text style={styles.goOnlineButtonText}>
                FINALIZAR {t('races')}
              </Text>
            ) : (
              <ActivityIndicator size={'small'} color={Colors.WHITE} />
            )}
          </TouchableOpacity>
        ) : null}

        {/** Parada Adicional */}
        {booking &&
          Array.isArray(booking) &&
          booking.length > 0 &&
          booking[0].status === 'in_progress' &&
          booking[0]?.additionalStops &&
          Array.isArray(booking[0].additionalStops) &&
          booking[0].additionalStops.length > booking[0].arrivedStops ? (
          <TouchableOpacity
            style={styles.goOnlineButton}
            onPress={() => arrivedStops()}
            disabled={load}>
            {!load ? (
              <Text style={styles.goOnlineButtonText}>
                CHEGUEI PARADA ADICIONAL {booking[0].arrivedStops + 1}
              </Text>
            ) : (
              <ActivityIndicator size={'small'} color={Colors.WHITE} />
            )}
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.sideOption} onPress={destiny}>
          <DestinyIcon />
          <Text style={styles.optionText}>DESTINOS</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
