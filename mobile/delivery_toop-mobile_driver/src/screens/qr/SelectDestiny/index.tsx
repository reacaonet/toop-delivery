/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import PointAB from '../../../assets/images/point-a-b.svg';
import { PlusIcon } from '../../../components/Icon';
import { Colors } from '../../../styles';

/** Service */
// import { linkToFranchise } from '../../../services/provider/passenger/linkToFranchise';
import { StorageGet, StorageSet } from '../../../services/deviceStorage';
import { geoCode } from '../../../services/provider/maps/geoCode';

/** Components */
import InputLocation from './components/InputLocation';
import PlacesAutocomplete from './components/PlacesAutocomplete';

/** Styles */
import styles, { Header, HeaderBackTouch, IconBack } from './styles';

const SelectDestiny = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();

  const {
    authUser: { user = null },
    coordinates,
  }: any = useSelector((state: any) => state);

  const [origin, setOrigin] = useState<any>({});
  const [destiny, setDestiny] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const [qrCode] = useState(route.params?.qrCode || '');
  const [driver] = useState(route.params?.driver || '');

  const stops = useRef(false);
  const [inputStops, setInputStops] = useState<any[]>([]);
  const additionalStops = useRef<any[]>([]);
  const getDestiny = useRef<any>(null);
  const getOrigin = useRef<any>(null);

  const [current, setCurrent] = useState<any>();

  useEffect(() => {
    const { latitude = null, longitude = null } = coordinates || {};

    async function getLocalName() {
      if (!latitude || !longitude) {
        return;
      }

      let geoLocation = await StorageGet('@user_loc_current');

      if (
        getOrigin.current === null &&
        (!geoLocation ||
          !geoLocation?.address ||
          !geoLocation?.latitude ||
          geoLocation?.latitude !== latitude ||
          geoLocation?.longitude !== longitude)
      ) {
        const respGeo = await geoCode({
          latitude: latitude,
          longitude: longitude,
        });

        if (respGeo && respGeo?.address && respGeo?.latitude) {
          await StorageSet('@user_loc_current', respGeo);
          geoLocation = respGeo;
        }
      }

      if (geoLocation && geoLocation?.address) {
        getOrigin.current = {
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.0143,
          longitudeDelta: 0.0134,
          details: geoLocation,
          main_text: geoLocation?.shortAddress || geoLocation?.address,
        };

        setOrigin(getOrigin.current);

        goSelectRide(
          {
            formatted_address: geoLocation?.address,
            geometry: {
              location: {
                lat: latitude,
                lng: longitude,
              },
            },
          },
          'origin',
          geoLocation?.address,
        );
      }
    }

    getLocalName();
    // setLinkToFranchise(latitude, longitude);
  }, [coordinates?.latitude, coordinates?.longitude]);

  useEffect(() => {
    if (route.params?.destiny && route.params?.destiny?.address) {
      goSelectRide(
        {
          formatted_address: route.params?.destiny?.address,
          geometry: {
            location: {
              lat: route.params?.destiny?.latitude || 0,
              lng: route.params?.destiny?.longitude || 0,
            },
          },
        },
        'destiny',
        route.params?.destiny?.address,
      );
    }
  }, [route.params?.destiny]);

  // vincular a uma franquia
  // const setLinkToFranchise = async (latitude: number, longitude: number) => {
  //   if (user?.passenger) {
  //     const respLink = await linkToFranchise(
  //       user?.person,
  //       user?.passenger,
  //       latitude,
  //       longitude,
  //     );

  //     if (respLink && respLink._id) {
  //       user.franchise = respLink._id;

  //       if (user.passenger) {
  //         user.passenger.franchise = respLink._id;
  //       }

  //       if (user.person) {
  //         user.person.franchise = respLink._id;
  //       }

  //       dispatch({
  //         type: 'SET_USER_SAGA',
  //         payload: user,
  //       });
  //     }
  //   }
  // };

  const goSelectRide = async (
    place: any,
    type: string,
    addres: string,
    index: number = 0,
  ) => {
    try {
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

        // setLinkToFranchise(
        //   details.geometry.location.lat,
        //   details.geometry.location.lng,
        // );
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

      dispatch({
        type: 'UPDATE_BOOKING_SAGA',
        payload: {
          status: 'create_request',
          origin: getOrigin.current,
          destiny: getDestiny.current,
          additionalStops: additionalStops.current || [],
        },
      });

      if (
        getOrigin.current !== null &&
        getDestiny.current !== null &&
        stops.current === false
      ) {
        return navigation.navigate('SelectRider', {
          chosenOrigin: getOrigin.current,
          chosenDestination: getDestiny.current,
          additionalStops: additionalStops.current || [],
          qrCode,
          driver,
        });
      }

      if (
        getOrigin.current !== null &&
        getDestiny.current !== null &&
        stops.current === true &&
        inputStops.length === additionalStops.current.length
      ) {
        return navigation.navigate('SelectRider', {
          chosenOrigin: getOrigin.current,
          chosenDestination: getDestiny.current,
          additionalStops: additionalStops.current || [],
          qrCode,
          driver,
        });
      }
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

  return (
    <SafeAreaView style={styles.SafeAreaContent}>
      <View style={styles.container}>
        <Modal visible={showModal}>
          <PlacesAutocomplete
            current={current}
            coordinates={coordinates}
            setShowModal={setShowModal}
            onClick={goSelectRide}
          />
        </Modal>

        <Header>
          <HeaderBackTouch
            onPress={() => {
              navigation.navigate('Qr');
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
                setCurrent({
                  placeholder: 'Localização atual',
                  type: 'origin',
                  key: 1,
                  index: 0,
                });
                setShowModal(true);
              }}
            />

            {inputStops &&
              Array.isArray(inputStops) &&
              inputStops.length > 0 &&
              inputStops.map((item: any, index) => {
                return (
                  <View key={`${Math.random()}`}>
                    <InputLocation
                      placeholder={
                        inputStops[index]?.main_text || 'Adicionar parada'
                      }
                      setShowModal={() => {
                        setCurrent({
                          placeholder: 'Adicionar parada',
                          type: 'stops',
                          key: `${item._id}`,
                          index: index,
                        });

                        setShowModal(true);
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
      </View>
    </SafeAreaView>
  );
};

export default SelectDestiny;
