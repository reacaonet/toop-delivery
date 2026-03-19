/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  AppState,
  Keyboard,
  BackHandler,
  StatusBar,
  Linking,
} from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/core';
import database from '@react-native-firebase/database';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import {
  ScoreIcon,
  MessageFilledIcon,
  ProfileIcon,
  LocationOutlineIcon,
} from '../../../components/Icon';

/** Components */
import MapDirection from './components/MapDirection';
import { MapHeader } from './components/MapHeader';

/** Service */
import { listActiveRun } from '../../../services/provider/passenger/activeRun';
import {
  getOriginMap,
  getDestinyMap,
  getAdditionalStops,
} from '../../../services/provider/passenger/direction';
import config from '../../../config';

/** Styles */
import { Colors } from '../../../styles';
import styles from './styles';

/** Images */
import manFaceImg from '../../../assets/images/photo.png';
// import bannerImg from './images/banner.jpg';
import phoneIcon from '../../../assets/images/phone.png';


/** Service */
import { listMessage } from '../../../services/provider/message/list';
import {
  StorageClean,
  StorageGet,
  StorageSet,
} from '../../../services/deviceStorage';
import {
  bookingInProgress,
  bookingConcluded,
  bookingCanceled,
  bookinArrivalconfirm,
  pixPaid,
  blockedUser,
  changeRoute,
} from '../../../services/provider/booking/firebaseBooking';

const RaceAccepted = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const {
    booking,
    user: { user = null },
    configurations = null,
  }: any = useSelector((state: any) => state);

  const modalizeRef = useRef(Modalize);
  const [load, setLoad] = useState(false);
  const [activeBooking, setActiveBooking]: any = useState({});

  const [originMap, setOriginMap] = useState<any>(null);
  const [destinyMap, setdestinyMap] = useState<any>(null);
  const [additionalStops, setAdditionalStops] = useState<any>([]);

  const [duration, setDuration] = useState('');
  const [message, setMessage] = useState<any>({});
  const [timeWating, setTimeWating] = useState<string>('');
  const initTime = useRef(false);

  // evento touchscreen
  useFocusEffect(
    useCallback(() => {
      Keyboard.dismiss();
      BackHandler.addEventListener('hardwareBackPress', () => {
        Keyboard.dismiss();
        return true;
      });

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', () => {
          return true;
        });
    }, []),
  );

  // corrida ativa
  useFocusEffect(
    useCallback(() => {
      StorageClean('@waitingDriver');
      let interval: any = null;

      listActiveRun(user?.passenger?._id).then(result => {
        if (result) {
          let itemDestiny = getDestinyMap(result);

          if (itemDestiny) {
            setdestinyMap(itemDestiny);
          }

          let itemOrigin = getOriginMap(result);
          if (itemOrigin) {
            setOriginMap(itemOrigin);
          }

          let itemAdditionalStops: any = getAdditionalStops(result);
          if (itemAdditionalStops && itemAdditionalStops.length > 0) {
            setAdditionalStops(itemAdditionalStops);
          }

          setActiveBooking(result);

          if (
            initTime.current === false &&
            result?.status === 'accepted' &&
            result?.arrivedLocal === true
          ) {
            StorageGet('@waitingPassenger').then(async resp => {
              initTime.current = true;

              let dataCurrent: any = moment().utc(false).format();

              if (!resp || resp === null) {
                await StorageSet('@waitingPassenger', `${dataCurrent}`);
              } else {
                dataCurrent = resp;
              }

              interval = setInterval(() => {
                dataCurrent = moment(dataCurrent).utc(false);
                let diff = moment.utc(moment().diff(moment(dataCurrent)));
                let minutes = Number(diff.format('mm'));
                let seconds = Number(diff.format('ss'));

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

              initTime.current = false;
            });
          }
        }
      });
    }, [user, booking]),
  );

  // Mensagens
  useFocusEffect(
    useCallback(() => {
      if (booking?.booking?._id) {
        getMessages();

        database()
          .ref(`${config.FIREBASE_PATH}chatRace/${booking?.booking?._id}`)
          .on('value', snapshot => {
            var value = snapshot.val();
            if (value) {
              getMessages();
            }
          });
      }
    }, [booking]),
  );

  // eventos Firebase Corrida
  useFocusEffect(
    useCallback(() => {
      if (user && user.passenger && user?.passenger?._id) {
        database()
          .ref(`${config.FIREBASE_PATH}passenger/${user.passenger._id}`)
          .on('value', async (snapshot: any) => {
            const notify: any = snapshot.val();
            if (notify?.type === 'race_inprogres' && notify?.booking) {
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
        console.log('parar de monitorar ...');
      };
    }, [user?.passenger?._id]),
  );

  const cancelSolicitation = async () => {
    navigation.navigate('CancelBooking');
  };

  const getDestiny = (destiny: Array<Object>) => {
    try {
      if (!Array.isArray(destiny) || destiny.length <= 0) {
        return '';
      }

      let item: any = destiny[destiny.length - 1];
      return item?.address;
    } catch (err) {
      return '';
    }
  };

  const getMessages = () => {
    listMessage(booking?.booking?._id).then(result => {
      if (result && Array.isArray(result)) {
        if (result.length > 0) {
          setMessage(result[result.length - 1]);
        } else {
          setMessage(null);
        }
      } else {
        setMessage(null);
      }
    });
  };

  const onPressEmergency = () => {
    let numberEmergency: string | number = 190;

    if (configurations?.emergencyPhone) {
      numberEmergency = configurations?.emergencyPhone;
    }


    return Linking.openURL(`tel:${numberEmergency}`);
  };

  const linkMakeCall = (phone: string) => {
    try {
      if (!phone) {
        return;
      }

      let phonStr = `${phone}`.match(/[0-9]/g)?.join('');
      phonStr = `${phone}`;

      Linking.openURL(`tel:${phonStr}`);
    } catch (err) {
      console.log('err', err);
    }
  };

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <View style={styles.container}>
        {originMap && destinyMap && user ? (
          <MapDirection
            origin={originMap}
            destiny={destinyMap}
            user={user}
            booking={activeBooking}
            setDuration={setDuration}
            additionalStops={
              activeBooking &&
                (activeBooking?.status === 'accepted' || activeBooking?.status === 'in_progress') &&
                activeBooking?.additionalStops &&
                Array.isArray(additionalStops) &&
                activeBooking?.additionalStops.length > activeBooking?.arrivedStops
                ? additionalStops
                : []
            }
          />
        ) : null}

        <MapHeader navigation={navigation} activeBooking={activeBooking} />

        <Modalize
          ref={modalizeRef}
          alwaysOpen={activeBooking?.arrivedLocal === true ? 250 : 175}
          adjustToContentHeight={true}
          modalStyle={styles.modalStyles}
          overlayStyle={styles.modalOverlay}>
          <View style={styles.modalContaienr}>
            <View style={styles.modalGrabber} />

            <View style={styles.driverInfoContainer}>
              {activeBooking?.driver?.selfiePhoto &&
                Array.isArray(activeBooking?.driver?.selfiePhoto) &&
                activeBooking?.driver?.selfiePhoto.length > 0 ? (
                <Image
                  source={{
                    uri: activeBooking?.driver?.selfiePhoto[0],
                  }}
                  style={styles.driverPhoto}
                />
              ) : (
                <Image source={manFaceImg} style={styles.driverPhoto} />
              )}

              <View style={styles.driverInfo}>
                <Text style={styles.plate}>
                  {activeBooking?.driver?.vehicleNameplate}
                </Text>
                <Text style={styles.carBrand}>
                  {activeBooking?.driver?.vehicleManufacturer}{' '}
                  {activeBooking?.driver?.vehicleModel}{' '}
                  {activeBooking?.driver?.vehicleColor}
                </Text>
                <View style={styles.driverScoreAndName}>
                  <Text style={styles.name} numberOfLines={1}>
                    {' '}
                    {activeBooking?.driver?.stars > 0 ? (
                      <>
                        <ScoreIcon width={12} height={12} color={Colors.BLACK} />
                        <Text>
                          {Number(activeBooking?.driver?.stars).toFixed(1)}
                          {' - '}
                        </Text>
                      </>
                    ) : null}
                    {activeBooking?.driver?.name}
                  </Text>
                </View>
              </View>

              {activeBooking?.franchise?.showPhoneRace?.driver === true ? (
                <TouchableOpacity style={styles.contentPhone} onPress={() => linkMakeCall(activeBooking?.driver?.phone)} >
                  {/* <Text style={styles.carBrand}>{t('phone')}: {activeBooking?.driver?.phone}</Text> */}
                  <Image source={phoneIcon} style={styles.phoneImage} resizeMode={'contain'} />
                </TouchableOpacity>
              ) : null}

              <View style={styles.timeLeftContainer}>
                {/* <Text style={styles.time}>2</Text> */}
                <Text style={styles.timeLabel}>{duration}</Text>
              </View>
            </View>

            {activeBooking &&
              activeBooking?.status === 'accepted' &&
              activeBooking?.arrivedLocal === true ? (
              <View>
                <Text style={styles.timeDistanceDestinyPassenger}>
                  Encontre o Motorista
                </Text>
                <View style={styles.line} />
                <View style={styles.timeView}>
                  <Text style={styles.timeDistanceDestiny}>{timeWating}</Text>
                </View>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.messageButton}
              onPress={() => {
                navigation.navigate('Message', {
                  screen: 'Conversation',
                  params: {
                    booking: booking?.booking?._id,
                    goBack: 'RaceAccepted',
                  },
                });
              }}>
              <MessageFilledIcon color={Colors.WHITE} width={23} height={23} />
              <Text style={styles.messageText} numberOfLines={1}>
                {message?.message}
              </Text>
              {/* <Text style={styles.newMessagesCount}>2</Text> */}
            </TouchableOpacity>

            <View style={styles.fieldLabelContainer}>
              <LocationOutlineIcon
                color={Colors.PRIMARY}
                width={13}
                height={13}
              />
              <Text style={styles.fieldLabel}>Destino</Text>
            </View>

            <TouchableOpacity style={styles.infoButton} onPress={() => {
              navigation.navigate('RideAndTravelStack', {
                screen: 'ChangeRoute',
              });
            }}>
              <Text style={styles.infoButtonValue}>
                {getDestiny(activeBooking?.destiny)}
              </Text>
              <Text style={styles.infoButtonLabel}>Trocar ou adicionar</Text>
            </TouchableOpacity>

            <View style={styles.fieldLabelContainer}>
              <ProfileIcon color={Colors.PRIMARY} width={13} height={13} />
              <Text style={styles.fieldLabel}>Perfil</Text>
            </View>

            <TouchableOpacity style={styles.infoButton} onPress={() => { }}>
              <Text style={styles.infoButtonValue}>{user?.person?.name}</Text>
              {/* <Text style={styles.infoButtonLabel}>Trocar</Text> */}
            </TouchableOpacity>

            {/* <Image source={bannerImg} style={styles.banner} /> */}

            <View style={styles.footer}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => { onPressEmergency(); }} >
                <Text style={styles.primaryButtonText}>EMERGÊNCIA</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                disabled={load}
                onPress={() => cancelSolicitation()}>
                {!load ? (
                  <Text style={styles.cancelButtonText}>CANCELAR</Text>
                ) : (
                  <ActivityIndicator size={'small'} color={Colors.PRIMARY} />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.block} />
          </View>
        </Modalize>
      </View>
    </>
  );
};

export default RaceAccepted;
