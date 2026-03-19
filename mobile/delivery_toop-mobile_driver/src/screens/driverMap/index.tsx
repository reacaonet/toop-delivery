/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Image, Dimensions, Linking, Alert, DeviceEventEmitter, Platform } from 'react-native';
import { SliderBox } from 'react-native-image-slider-box';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
// import * as RNLocalize from 'react-native-localize';
import { Colors, Typography } from '../../styles';
import styles, {
  ContainerModal,
  Header,
  ContentRice,
  TitleHeader,
  DestinyCard,
  CompassCard,
  TitleCard,
  BoxTitleCard,
  Title,
  Description,
  ButtonBox,
  IconTouchable,
  ButtonDescription,
  ConfirmButton,
  NotDestinationContent,
  NotDestinationText,
  ServiceContent,
  ServiceItem,
  ServiceImage,
  ServiceTitle,
} from './styles';
import { Modalize } from 'react-native-modalize';
const { height } = Dimensions.get('window');
import { useFocusEffect } from '@react-navigation/core';
import IdleTimerManager from 'react-native-idle-timer';
import database, {
  FirebaseDatabaseTypes,
} from '@react-native-firebase/database';

/** Service */
import {
  getDestinyMap,
  getAdditionalStops,
} from '../../services/provider/user/direction';
import {
  stopBackground,
  updateBackground,
} from '../../services/Background/backgroundActions';
import {
  watchLocation,
  clearWatch,
} from '../../services/provider/geolocation/location';
import {
  bookingEvaluation,
  bookingCanceled,
  blockedUser,
  changeRoute,
} from '../../services/provider/booking/firebaseBooking';
import { StorageSet, StorageClean } from '../../services/deviceStorage';

import { listDestination } from '../../services/provider/chosenDestinations/listDestinations';
import { deleteDestination } from '../../services/provider/chosenDestinations/deleteDestiantios';
import { listTypesServices } from '../../services/provider/service/listTypePaymentService';
import { updateDriver } from '../../services/provider/user/update';
import { listSliders } from '../../services/provider/slider';

/** Util */
import getDirections from '../../utils/mapOptions';
import { distanceCurrentRace } from '../../utils';

/** Components */
import { Map } from '../../components/Map';
import MapDirection from './components/MapDirection';
import { MapHeader } from './components/MapHeader';
import { MapButtons } from './components/MapButtons';
import { MapFooter } from './components/MapFooter';

import Compass from '../../assets/images/compass.svg';

import config from '../../config';

const DriverMap = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const {
    authUser: { user = null },
    booking: { booking = null },
    driverLocation,
    configurations = null,
  }: any = useSelector((state: any) => state);

  const [isAccept, setIsAccept] = useState(false);

  const [passenger, setPassenger] = useState<any>(null);
  const [originMap, setOriginMap] = useState<any>(null);
  const [destinyMap, setdestinyMap] = useState<any>(null);
  const [additionalStops, setAdditionalStops] = useState<any>([]);
  const [duration, setDuration] = useState('');
  const [destinations, setDestinations] = useState<any>(null);
  const [typesServices, setTypesServices] = useState<any>([]);
  const [services, setServices] = useState<any>([]);
  const [distance, setDistance] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [timeToEnd, setTimeToEnd] = useState<number | null>(0);
  const [sliders, setSliders] = useState<any[]>([]);
  const [images, setImages] = useState<any>([]);

  // const [load, setLoad] = useState(false);

  const destinyModal = useRef<Modalize>(null);
  const preventionModal = useRef<Modalize>(null);
  const securityModal = useRef<Modalize>(null);
  const compassModal = useRef<Modalize>(null);
  const servicesModal = useRef<Modalize>(null);
  const loadingSliders = useRef(false);
  const watchLoc = useRef<any>(null);
  const attempts = useRef(0);

  useEffect(() => {
    IdleTimerManager.setIdleTimerDisabled(true, undefined);

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

    setServices([
      {
        _id: 'driver',
        name: 'Viagens',
        image: require('../../assets/images/category/Mob.png'),
        imageOf: require('../../assets/images/category/Mob-off.png'),
      },
      {
        _id: 'package',
        name: 'Encomendas',
        image: require('../../assets/images/category/Frete.png'),
        imageOf: require('../../assets/images/category/Frete-off.png'),
      },
    ]);

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
  }, []);

  useEffect(() => {
    if (!user?.franchise) {
      return;
    }

    let params: any = {
      franchise: user?.franchise,
      type: 'driver',
    };

    if (loadingSliders.current === false && sliders.length <= 0) {
      loadingSliders.current = true;

      listSliders(params).then((result: any) => {
        if (result && Array.isArray(result)) {
          let listImages = result.map(item => {
            return item?.image[0];
          });

          setImages(listImages);
          setSliders(result);
        } else {
          setImages([]);
          setSliders([]);
        }

        setTimeout(() => {
          loadingSliders.current = false;
        }, 1000);
      });
    }
  }, [user?.franchise]);

  // INIT SERVICE BACKGROUND
  useFocusEffect(
    useCallback(() => {
      if (
        booking &&
        Array.isArray(booking) &&
        booking.length > 0 &&
        (booking[0]?.status === 'accepted' ||
          booking[0]?.status === 'in_progress')
      ) {
        StorageSet('@bookingCurrentLocation', booking[0]).then(() => {
          updateBackground();
        });
      } else if (`${user?.online}` === 'true' && !booking) {
        StorageClean('@bookingCurrentLocation').then(() => {
          updateBackground();
        });
      } else if (`${user?.online}` === 'false' && booking && Array.isArray(booking) && booking.length > 0) {
        StorageSet('@bookingCurrentLocation', booking[0]).then(() => {
          updateBackground();
        });
      } else {
        console.log('está off ...');
        StorageClean('@bookingCurrentLocation').then(() => {
          DeviceEventEmitter.removeAllListeners('onSessionLocation');
          stopBackground();
        });
      }
    }, [booking, user?._id]),
  );

  useFocusEffect(
    useCallback(() => {
      if (
        booking &&
        Array.isArray(booking) &&
        booking.length > 0 &&
        (booking[0].status === 'accepted' ||
          booking[0].status === 'in_progress') &&
        driverLocation?.location
      ) {
        if (
          booking[0]?.passenger &&
          (!passenger || passenger?._id !== booking[0].passenger)
        ) {
          setPassenger(booking[0].passenger);
        }

        let itemDestiny = getDestinyMap(booking[0]);
        if (itemDestiny && destinyMap?.latitude !== itemDestiny?.latitude) {
          setdestinyMap(itemDestiny);
        }

        if (driverLocation?.location?.latitude && (!originMap || originMap?.latitude !== driverLocation?.location?.latitude)) {
          setOriginMap({
            latitude: driverLocation.location.latitude,
            longitude: driverLocation.location.longitude,
            bearing: driverLocation?.location?.bearing || null,
          });
        }

        let itemAdditionalStops: any = getAdditionalStops(booking[0]);
        let distanceKm: any = distanceCurrentRace(
          itemAdditionalStops,
          driverLocation,
          itemDestiny,
          booking[0].status,
        );

        // Quando estiver próximo do local
        if (distanceKm < 0.4) {
          let timeResp = parseInt(
            `${Math.round((Number(`${distanceKm}`) / 32) * 60)}`,
            10,
          );

          if (timeResp < 1) {
            setTime('1 min');
            setTimeToEnd(1);
          } else {
            setTime(`${timeResp} min`);
            setTimeToEnd(timeResp * 60);
          }
        }
      } else {
        setOriginMap(null);
        setdestinyMap(null);
        setDuration('');
        setDistance(null);
        setTime(null);
      }
    }, [
      booking,
      user?._id,
      driverLocation?.location?.latitude,
      driverLocation?.location?.longitude,
    ]),
  );

  useFocusEffect(
    useCallback(() => {
      if (
        user?._id &&
        booking &&
        Array.isArray(booking) &&
        booking.length > 0 &&
        (booking[0].status === 'accepted' ||
          booking[0].status === 'in_progress')
      ) {
        if (watchLoc.current === null) {
          if (Platform.OS === 'ios') {
            watchLoc.current = watchLocation(dispatch, user, 10000);
          }
        }
      } else {
        if (watchLoc.current !== null) {
          clearWatch(watchLoc.current);
          watchLoc.current = null;
        }
      }

      return () => {
        if (watchLoc.current !== null) {
          clearWatch(watchLoc.current);
          watchLoc.current = null;
        }
      };
    }, [user?._id, booking]),
  );

  // Update Booking
  useFocusEffect(useCallback(() => {
    attempts.current = 0;

    if (user?._id) {
      database().ref(`${config.FIREBASE_PATH}driver/${user?._id}`).on('value', async snapshot => {
        try {
          const respNotify = snapshot.val();
          if (
            respNotify?.type === 'race_concluded' &&
            respNotify?.booking
          ) {
            bookingEvaluation(user, respNotify, dispatch, navigation.navigate);
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
  }, [user?._id]));

  const handleConfirmTerms = () => {
    setIsAccept(!isAccept);
  };

  const externalNavigation = async (appName: string) => {
    try {
      const data: any = {};

      data.source = {
        latitude: driverLocation.location.latitude,
        longitude: driverLocation.location.longitude,
      };

      data.destination = getDestinyMap(booking[0]);

      data.waypoints = getAdditionalStops(booking[0]);

      data.params = [
        {
          key: 'travelmode',
          value: 'driving', // may be "walking", "bicycling" or "transit" as well
        },
        {
          key: 'dir_action',
          value: 'navigate', // this instantly initializes navigation using the given travel mode
        },
      ];

      await getDirections(data, appName);
    } catch (err) {
      console.log('fail externalNavigation', err);
    }
  };

  const callPolice = () => {
    let numberEmergency: string | number = 190;

    if (configurations?.emergencyPhone) {
      numberEmergency = configurations?.emergencyPhone;
    }

    return Linking.openURL(`tel:${numberEmergency}`);
  };

  const searchDestinations = async () => {
    const response = await listDestination(user?._id);

    if (response && Array.isArray(response) && response.length > 0) {
      setDestinations(response);
    } else {
      setDestinations(null);
    }
  };

  const optionsDestinatios = (destination: any) => {
    // console.log('destination', destination);

    return Alert.alert(
      'Deseja remover ?',
      'Gostaria de excluir este Destino ?',
      [
        {
          text: 'SIM',
          onPress: () => {
            confirmDeleteDestination(destination);
          },
        },
        {
          text: 'NÃO',
        },
      ],
    );
  };

  const confirmDeleteDestination = async (destination: any) => {
    const response = await deleteDestination(user?._id, destination._id);

    if (response && response.errMessage) {
      return Alert.alert('Excluir', response.errMessage);
    }

    destinyModal.current?.close();
  };

  const searchListTypesServices = async () => {
    const list = await listTypesServices({
      driver: user?._id,
    });
    if (list && Array.isArray(list) && list.length > 0) {
      setTypesServices(list);
    } else {
      setTypesServices([]);
    }
  };

  const clickTypeServices = (item: any) => {
    const selected = isSelected(item);

    let typePaymentService = Array.isArray(user?.typePaymentService)
      ? user?.typePaymentService
      : [];

    if (selected) {
      typePaymentService = typePaymentService.filter(
        (element: any) => element !== item._id,
      );
    } else {
      typePaymentService.push(item._id);
    }

    updateDriver(user?._id, {
      typePaymentService,
    });

    dispatch({
      type: 'SET_USER_SAGA',
      payload: {
        ...user,
        typePaymentService,
      },
    });
  };

  const isSelected = (item: any) => {
    if (
      user?.typePaymentService &&
      Array.isArray(user?.typePaymentService) &&
      user?.typePaymentService.length > 0
    ) {
      const resp = user.typePaymentService.find(
        (element: any) => element === item._id,
      );

      return resp ? true : false;
    }

    return false;
  };

  const isSelectedService = (item: any) => {
    if (
      user?.categoryServices &&
      Array.isArray(user?.categoryServices) &&
      user?.categoryServices.length > 0
    ) {
      const resp = user.categoryServices.find(
        (element: any) => element === item._id,
      );

      return resp ? true : false;
    }

    return false;
  };

  const clickSelectServices = (item: any) => {
    const selected = isSelectedService(item);

    let servicesR: any = Array.isArray(user?.categoryServices)
      ? user?.categoryServices
      : [];

    if (selected) {
      servicesR = servicesR.filter((element: any) => element !== item._id);
    } else {
      servicesR.push(item._id);
    }

    updateDriver(user?._id, {
      categoryServices: servicesR,
    });

    dispatch({
      type: 'SET_USER_SAGA',
      payload: {
        ...user,
        categoryServices: servicesR,
      },
    });
  };

  return (
    <View style={styles.container}>
      {originMap && destinyMap && passenger?._id ? (
        <MapDirection
          origin={originMap}
          destiny={destinyMap}
          passenger={passenger}
          setDuration={setDuration}
          // markerIcon={booking &&
          //   Array.isArray(booking) &&
          //   booking[0].marker}
          additionalStops={booking && Array.isArray(booking) && booking[0]?.status === 'in_progress'
            ? getAdditionalStops(booking[0])
            : []
          }
          setFunction={(result: any) => {
            console.log('result', result);

            if (result?.duration) {
              setTimeToEnd(parseInt(`${result?.duration}`, 10) * 60);
              setTime(result?.duration);
            }

            if (result?.distance >= 0) {
              setDistance(`${result?.distance}`);
            }
          }}
        />
      ) : null}

      {!originMap && !destinyMap && driverLocation?.location ? (
        <Map origin={driverLocation?.location} />
      ) : null}

      <MapHeader
        navigation={navigation}
        booking={booking}
        destiny={destinyMap}
        time={time}
      />

      <MapButtons
        onPress={() => securityModal.current?.open()}
        compass={() => compassModal.current?.open()}
        onPressExternalNavigation={externalNavigation}
        booking={booking}
        driverLocation={driverLocation}
        originMap={originMap}
        setOriginMap={setOriginMap}
      />

      <MapFooter
        onPress={() => preventionModal.current?.open()}
        destiny={() => {
          destinyModal.current?.open();
          searchDestinations();
        }}
        services={() => {
          servicesModal.current?.open();
          searchListTypesServices();
        }}
        booking={booking}
        driverLocation={driverLocation}
        distance={distance}
        time={time}
        timeToEnd={timeToEnd}
      />

      {images && Array.isArray(images) && images.length > 0 ? (
        <SliderBox
          ImageComponent={FastImage}
          images={images}
          sliderBoxHeight={110}
          dotColor={Colors.ALERT}
          inactiveDotColor={Colors.DARK_LIGHT}
          paginationBoxVerticalPadding={5}
          activeOpacity={0.9}
          autoplay
          circleLoop
          resizeMethod={'resize'}
          resizeMode={'stretch'}
          width={'100%'}
          autoplayInterval={8000}
          onCurrentImagePressed={(index: number) => {
            const destinationurl = sliders[index]?.destinationurl || null;
            if (destinationurl) {
              Linking.openURL(destinationurl);
            }
          }}
        />
      ) : null}

      {/* MODAL DESTINY */}
      <Modalize
        ref={destinyModal}
        // alwaysOpen={400}
        modalStyle={styles.modalDestiny}
        overlayStyle={styles.modalDestinyOverlayStyle}>
        <ContainerModal>
          <Header onPress={() => destinyModal.current?.close()}>
            <TitleHeader>Destino Escolhido</TitleHeader>
            <Icon name="keyboard-arrow-down" size={42} color={Colors.PRIMARY} />
          </Header>
          <ContentRice>
            {destinations &&
              Array.isArray(destinations) &&
              destinations.length > 0 ? (
              destinations.map((item: any) => {
                return (
                  <DestinyCard
                    key={item._id}
                    onPress={() => optionsDestinatios(item)}>
                    <BoxTitleCard>
                      <Image
                        source={require('../../assets/images/compass.png')}
                        style={styles.imageDestiny}
                        resizeMode="contain"
                      />
                      <TitleCard>Receber {t('races')} com destino:</TitleCard>
                    </BoxTitleCard>
                    <BoxTitleCard style={{ marginLeft: 6, marginTop: 10 }}>
                      <Image
                        source={require('../../assets/images/destinyIcon.png')}
                        style={styles.imgDestinyIcon}
                        resizeMode="contain"
                      />
                      <TitleCard>{item?.location?.address}</TitleCard>
                    </BoxTitleCard>
                  </DestinyCard>
                );
              })
            ) : (
              <NotDestinationContent>
                <NotDestinationText>
                  Nenhum destino cadastrado
                </NotDestinationText>
              </NotDestinationContent>
            )}
          </ContentRice>
        </ContainerModal>
      </Modalize>

      {/* MODAL DESTINY */}

      {/* MODAL DO BOTÃO ONLINE */}
      <Modalize
        ref={preventionModal}
        modalStyle={styles.modalStyle}
        overlayStyle={styles.modalOverlayStyle}>
        <ContainerModal style={{ alignItems: 'center' }}>
          <Header
            onPress={() => {
              preventionModal.current?.close();
              destinyModal.current?.close();
            }}>
            <Icon name="keyboard-arrow-down" size={42} />
          </Header>
          <Image
            source={require('../../assets/images/mask.png')}
            style={{ height: 87 }}
            resizeMode="contain"
          />
          <Title>Confirme prevenção</Title>
          <Description>
            É de grande importância seguir as{'\n'}medidas de prevenção neste
            momento de{'\n'}pandemia. Cuide de você e do passageiro
          </Description>
          <ButtonBox>
            <IconTouchable
              onPress={handleConfirmTerms}
              style={{
                backgroundColor: isAccept ? Colors.PRIMARY : Colors.WHITE,
                borderColor: isAccept ? Colors.PRIMARY : Colors.GRAY_TEXT,
              }}
            />
            <ButtonDescription>
              Não dirigir com sintomas relacionados{'\n'}ou diagnosticado com
              Covid-19
            </ButtonDescription>
          </ButtonBox>

          <ButtonBox>
            <IconTouchable
              onPress={handleConfirmTerms}
              style={{
                backgroundColor: isAccept ? Colors.PRIMARY : Colors.WHITE,
                borderColor: isAccept ? Colors.PRIMARY : Colors.GRAY_TEXT,
              }}
            />
            <ButtonDescription>
              Ter álcool em gel disponível no carro
            </ButtonDescription>
          </ButtonBox>

          <ButtonBox>
            <IconTouchable
              onPress={handleConfirmTerms}
              style={{
                backgroundColor: isAccept ? Colors.PRIMARY : Colors.WHITE,
                borderColor: isAccept ? Colors.PRIMARY : Colors.GRAY_TEXT,
              }}
            />
            <ButtonDescription>Não dirigir sem máscara</ButtonDescription>
          </ButtonBox>

          <ButtonBox style={{ borderBottomWidth: 0 }}>
            <IconTouchable
              onPress={handleConfirmTerms}
              style={{
                backgroundColor: isAccept ? Colors.PRIMARY : Colors.WHITE,
                borderColor: isAccept ? Colors.PRIMARY : Colors.GRAY_TEXT,
              }}
            />
            <ButtonDescription>
              Desinfetar o carro a cada viagem
            </ButtonDescription>
          </ButtonBox>
          <ConfirmButton
            style={{
              backgroundColor: isAccept ? Colors.ALERT : Colors.GREY_BACKGROUND,
            }}
            disabled={!isAccept}
            onPress={() => {
              preventionModal.current?.close();
              destinyModal.current?.close();
            }}>
            <ButtonDescription
              style={{
                fontSize: 22,
                color: isAccept ? Colors.WHITE : Colors.GRAY_TEXT,
              }}>
              Continuar
            </ButtonDescription>
          </ConfirmButton>
        </ContainerModal>
      </Modalize>
      {/* MODAL DO BOTÃO ONLINE */}

      {/* MODAL DO BOTÃO SEGURO */}
      <Modalize
        ref={securityModal}
        // alwaysOpen={400}
        modalStyle={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          overflow: 'hidden',
          elevation: 7,
          marginTop: height / 2.5,
        }}
        overlayStyle={{
          backgroundColor: 'transparent',
        }}>
        <ContainerModal>
          <Header
            onPress={() => securityModal.current?.close()}
            style={{ backgroundColor: Colors.WHITE }}>
            <TitleHeader>Segurança</TitleHeader>
            <Icon name="keyboard-arrow-down" size={42} color={Colors.PRIMARY} />
          </Header>
          <View
            style={{
              width: '88%',
              backgroundColor: Colors.GRAY_LIGHT,
              marginVertical: 18,
              height: 1,
              marginLeft: 20,
            }}
          />
          <Title
            style={{
              fontSize: Typography.FONT_SIZE_16,
              marginLeft: 22,
              fontWeight: '600',
            }}>
            Acompanhar viagem
          </Title>
          <ConfirmButton
            style={{
              backgroundColor: Colors.GREY_BACKGROUND,
              bottom: height / 2.5,
              alignItems: 'flex-start',
              paddingHorizontal: 18,
            }}>
            <ButtonDescription
              style={{
                fontSize: Typography.FONT_SIZE_15,
                color: '#D96D00',
              }}
              onPress={() => callPolice()}>
              Ligar para a polícia
            </ButtonDescription>
          </ConfirmButton>
        </ContainerModal>
      </Modalize>
      {/* MODAL DO BOTÃO SEGURO */}

      {/* MODAL DO BOTÃO COMPASS */}
      <Modalize
        ref={compassModal}
        modalStyle={styles.modalStyleDestiny}
        overlayStyle={styles.modalStyleOverlayDestiny}>
        <ContainerModal style={{ alignItems: 'center' }}>
          <Header
            onPress={() => {
              compassModal.current?.close();
              destinyModal.current?.close();
            }}
            style={styles.modalStyleDestin}>
            <Icon name="keyboard-arrow-left" size={42} color={Colors.PRIMARY} />
          </Header>

          <Compass width={160} height={160} fill={Colors.PRIMARY} />

          <Title>Escolher destino</Title>
          <Description>
            Aqui você aponta a direção{'\n'}
            para destinos de até 3 {t('races')} {'\n'}
          </Description>

          <CompassCard
            onPress={() => navigation.navigate('ChosenDestinations')}>
            <BoxTitleCard>
              <TitleCard style={{ color: Colors.PRIMARY }}>
                Selecione um destino
              </TitleCard>
            </BoxTitleCard>
            <View style={{ flexDirection: 'row' }}>
              <BoxTitleCard style={{ marginTop: 10 }}>
                <TitleCard style={{ fontSize: 15, color: Colors.GRAY_TEXT }}>
                  Receba {t('races')} com destinos{'\n'}direcionado à sua
                  necessidade
                </TitleCard>
              </BoxTitleCard>
              <Icon
                name="keyboard-arrow-right"
                size={42}
                style={{ marginTop: -10, marginLeft: 10 }}
                color={Colors.PRIMARY}
              />
            </View>
          </CompassCard>
        </ContainerModal>
      </Modalize>
      {/* MODAL DO BOTÃO COMPASS */}

      {/* MODAL DO BOTÃO SERVIÇOS */}
      <Modalize
        ref={servicesModal}
        // alwaysOpen={400}
        modalStyle={styles.modalStyleService}
        overlayStyle={styles.modalStyleOverService}>
        <ContainerModal style={{ alignItems: 'center' }}>
          <Header
            onPress={() => servicesModal.current?.close()}
            style={{ backgroundColor: Colors.WHITE }}>
            <TitleHeader>Serviços</TitleHeader>
            <Icon name="keyboard-arrow-down" size={42} color={Colors.PRIMARY} />
          </Header>
          <Description>
            Escolha os tipos de serviços que irá receber
          </Description>

          <ServiceContent
            horizontal={true}
            data={services}
            keyExtractor={(item: any) => item._id}
            renderItem={({ item }: any) => (
              <ServiceItem
                onPress={() => clickSelectServices(item)}
                selected={isSelectedService(item)}>
                {item?.image ? (
                  <ServiceImage
                    source={
                      isSelectedService(item) ? item?.image : item?.imageOf
                    }
                    resizeMode={'contain'}
                  />
                ) : null}
                <ServiceTitle selected={isSelectedService(item)}>
                  {item?.name}
                </ServiceTitle>
              </ServiceItem>
            )}
          />

          {typesServices &&
            Array.isArray(typesServices) &&
            typesServices.length > 0
            ? typesServices.map((item): any => {
              return (
                <ButtonBox key={item?._id}>
                  <IconTouchable
                    onPress={() => clickTypeServices(item)}
                    style={[
                      isSelected(item)
                        ? {
                          backgroundColor: Colors.PRIMARY,
                          borderColor: Colors.PRIMARY,
                        }
                        : {
                          backgroundColor: Colors.WHITE,
                          borderColor: Colors.GRAY_TEXT,
                        },
                    ]}
                  />
                  <ButtonDescription>{item?.name}</ButtonDescription>
                </ButtonBox>
              );
            })
            : null}
        </ContainerModal>
      </Modalize>
      {/* MODAL DO BOTÃO SERVIÇOS */}
    </View>
  );
};

export default DriverMap;
