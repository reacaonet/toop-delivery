/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';

import PointAB from '../../../assets/images/point-a-b.svg';
import { PlusIcon } from '../../../components/Icon';
import { Colors } from '../../../styles';

/** Service */
import { geoCode } from '../../../services/provider/maps/geoCode';
import { changeRouteBooking } from '../../../services/provider/booking/chageRoute';

/** Components */
import InputLocation from './components/InputLocation';
import PlacesAutocomplete from './components/PlacesAutocomplete';

/** Styles */
import styles, { Header, HeaderBackTouch, IconBack } from './styles';
import { updateBooking } from '../../../store/actions/booking';

const ChangeRoute = () => {
  const dispatch: any = useDispatch();
  const navigation: any = useNavigation<any>();
  const route = useRoute<any>();

  const {
    booking,
    user: { user = null },
  }: any = useSelector((state: any) => state);

  const [origin, setOrigin] = useState<any>(null);
  const [destiny, setDestiny] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [load, setLoad] = useState(false);

  const stops = useRef(false);
  const [inputStops, setInputStops] = useState<any[]>([]);
  const additionalStops = useRef<any[]>([]);
  const getDestiny = useRef<any>(null);
  const getOrigin = useRef<any>(null);
  const changed = useRef(false);

  const [current, setCurrent] = useState<any>();

  useEffect(() => {
    if (booking?.booking?.origin) {
      getOrigin.current = {
        latitude: booking?.booking?.origin?.coordinates[1] || 0,
        longitude: booking?.booking?.origin?.coordinates[0] || 0,
        main_text: booking?.booking?.origin?.address,
        details: {
          formatted_address: booking?.booking?.origin?.address,
        },
      };

      setOrigin(getOrigin.current);
    }

    if (
      booking?.booking?.destiny &&
      Array.isArray(booking?.booking?.destiny) &&
      booking?.booking?.destiny.length > 0
    ) {
      const lastIdx = booking?.booking?.destiny.length - 1;

      getDestiny.current = {
        latitude: booking?.booking?.destiny[lastIdx]?.coordinates[1] || 0,
        longitude: booking?.booking?.destiny[lastIdx]?.coordinates[0] || 0,
        main_text: booking?.booking?.destiny[lastIdx]?.address,
        details: {
          formatted_address: booking?.booking?.destiny[lastIdx]?.address,
        },
      };

      setDestiny(getDestiny.current);
    }

    if (
      booking?.booking?.additionalStops &&
      Array.isArray(booking?.booking?.additionalStops) &&
      booking?.booking?.additionalStops.length > 0
    ) {
      let additional = booking?.booking?.additionalStops.map((item: any) => {
        return {
          _id: item?._id || `${Math.random()}`,
          latitude: item?.coordinates[1] || 0,
          longitude: item?.coordinates[0] || 0,
          main_text: item?.address,
          details: {
            formatted_address: item?.address,
          },
        };
      });

      additionalStops.current = additional;
      setInputStops(additional);
    }
  }, [booking?.booking?.origin]);

  const goSelectRide = async (
    place: any,
    type: string,
    addres: string,
    index: number = 0,
  ) => {
    try {
      setLoad(true);
      let repsGeo: any = null;

      if (typeof place === 'string') {
        repsGeo = await geoCode({ placeId: place });
      } else {
        repsGeo = place;
      }

      if (!repsGeo || !repsGeo?.geometry) {
        return;
      }

      let details: any = repsGeo;

      if (type === 'origin') {
        getOrigin.current = {
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
          latitudeDelta: 0.0143,
          longitudeDelta: 0.0134,
          main_text: addres,
          details,
        };

        setOrigin(getOrigin.current);
      }

      if (type === 'destiny') {
        getDestiny.current = {
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
          latitudeDelta: 0.0143,
          longitudeDelta: 0.0134,
          main_text: addres,
          details,
        };

        setDestiny(getDestiny.current);
      }

      if (type === 'stops') {
        additionalStops.current[index || 0] = {
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
          main_text: addres,
          details: details,
        };

        let newArray: any[] = [...inputStops];
        newArray[index].main_text = addres;
        setInputStops(newArray);
      }

      changed.current = true;
      setLoad(false);
    } catch (err) {
      console.log('fail goSelectRide', type, err);
    }
  };

  const addStops = () => {
    stops.current = true;

    if (inputStops.length >= 2) {
      return;
    }

    let newArray: any = [...inputStops];
    newArray.push({
      _id: `${Math.random()}`,
    });

    setInputStops(newArray);
  };

  const removeStops = (index: number) => {
    try {
      if (!inputStops || !Array.isArray(inputStops) || inputStops.length <= 0) {
        return;
      }

      changed.current = true;
      let newArray = [...inputStops];
      newArray.splice(index, 1);

      setInputStops(newArray);
      additionalStops.current = newArray;
    } catch (err) {
      //
    }
  };

  const sendChangeRoute = async () => {
    try {
      let destinyUp: any = [];
      let additionalStopsUp: any = [];

      if (!changed.current) {
        return Alert.alert('Alterar Rota', 'Informe sua nova rota');
      }

      if (
        additionalStops.current &&
        Array.isArray(additionalStops.current) &&
        additionalStops.current.length > 0
      ) {
        additionalStopsUp = additionalStops.current.map((item: any) => {
          return {
            address: item?.details?.formatted_address,
            latitude: item?.latitude,
            longitude: item?.longitude,
          };
        });
      }

      destinyUp = additionalStopsUp.concat([
        {
          address: getDestiny.current?.details?.formatted_address,
          latitude: getDestiny.current?.latitude,
          longitude: getDestiny.current?.longitude,
        },
      ]);

      const payload = {
        booking: booking?.booking?._id,
        destiny: destinyUp,
        additionalStops: additionalStopsUp,
      };

      // console.log('payload', payload);

      setLoad(true);
      const response = await changeRouteBooking(payload);

      if (response.errMessage) {
        setLoad(false);
        return Alert.alert('Alterar Rota', response.errMessage);
      }

      dispatch(updateBooking({
        payload: {
          title: 'Rota Alterada',
          description: 'Rota Alterada com sucesso!',
        },
      }));

      setLoad(false);

      setTimeout(() => {
        navigation.navigate('RideAndTravelStack', {
          screen: 'RaceAccepted',
        });
      }, 1000);
    } catch (err) {
      setLoad(false);
    }
  };

  return (
    <SafeAreaView style={styles.SafeAreaContent}>
      <View style={styles.container}>
        {origin ? (
          <Modal visible={showModal}>
            <PlacesAutocomplete
              current={current}
              coordinates={{
                latitude: origin?.latitude || 0,
                longitude: origin?.longitude || 0,
              }}
              setShowModal={setShowModal}
              onClick={goSelectRide}
            />
          </Modal>
        ) : null}

        {load ? (
          <Modal visible={true} transparent>
            <View style={styles.loadContainer}>
              <ActivityIndicator size={'large'} color={Colors.PRIMARY} />
              <Text>Aguarde ...</Text>
            </View>
          </Modal>
        ) : null}

        <Header>
          <HeaderBackTouch
            onPress={() => {
              navigation.navigate('RideAndTravelStack', {
                screen: 'RaceAccepted',
                params: {},
              });
            }}>
            <IconBack name="navigate-before" size={30} color={Colors.BLACK} />
          </HeaderBackTouch>
        </Header>

        <View style={styles.destinyFields}>
          <View style={styles.lateral}>
            <PointAB width={28} height="50%" />
          </View>
          <View style={styles.fields}>
            <InputLocation
              placeholder={origin?.main_text || 'Localização atual'}
              setShowModal={() => {
                // setCurrent({
                //   placeholder: 'Localização atual',
                //   type: 'origin',
                //   key: 1,
                //   index: 0,
                // });
                // setShowModal(true);
              }}
              disabled={true}
            />

            {inputStops &&
              Array.isArray(inputStops) &&
              inputStops.length > 0 &&
              inputStops.map((item: any, index) => {
                return (
                  <View key={`${Math.random()}`}>
                    <InputLocation
                      placeholder={
                        inputStops[index]?.main_text || 'Adicionar uma parada'
                      }
                      setShowModal={() => {
                        setCurrent({
                          placeholder: 'Adicionar uma parada',
                          type: 'stops',
                          key: `${item._id}`,
                          index: index,
                        });

                        setShowModal(true);
                      }}
                      btClose={true}
                      btnCloseClick={() => {
                        removeStops(index);
                      }}
                    />
                  </View>
                );
              })}

            <InputLocation
              placeholder={destiny?.main_text || 'Para onde?'}
              setShowModal={() => {
                setCurrent({
                  placeholder: 'Para onde?',
                  type: 'destiny',
                  key: 2,
                  index: 0,
                });
                setShowModal(true);
              }}
            />
          </View>
          <View style={styles.viewAddStop}>
            <TouchableOpacity
              onPress={() => addStops()}
              style={styles.plusButton}>
              <PlusIcon width={14} height={14} color={Colors.PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.containerInfo}>
          <Text style={styles.infoTitle}>
            Fazer alterações pode afetar o preço da viagem
          </Text>
          <Text style={styles.infoText}>
            Se você adicionar uma parada ou mudar seu destino, o total da viagem
            será alterado. Em consideração ao motorista, não demore mais de 2
            minutos em cada parada
          </Text>
        </View>

        <TouchableOpacity
          style={styles.containerButton}
          onPress={() => sendChangeRoute()}
          disabled={load}>
          <Text style={styles.textConfirm}>Pronto</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ChangeRoute;
