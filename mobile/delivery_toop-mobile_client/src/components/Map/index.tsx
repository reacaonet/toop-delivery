/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  memo,
  SetStateAction,
} from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { GooglePlaceData } from 'react-native-google-places-autocomplete';
import Icon from 'react-native-vector-icons/MaterialIcons';
// import Geolocation from '@react-native-community/geolocation';
import Geolocation from 'react-native-geolocation-service';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/core';

import CustomMarker from './components/CustomMarker';

import { Colors } from '../../styles';

import styles, { ButtonLocation, ContainerLoad, Load, LoadText } from './styles';
import CarImg from '../../assets/images/map/car.png';

/** Services */
import { nearbyDrivers } from '../../services/provider/driver/nearbyDrivers';
import { linkToFranchise } from '../../services/provider/passenger/linkToFranchise';
import { setUser } from '../../store/actions/user';
import { getCurrentPosition } from '../../utils';

export type LocationType = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
  address?: string;
  data?: GooglePlaceData;
  details?: any | null;
  main_text?: string;
};

type MapProps = {
  nearby?: Boolean;
  chosenOrigin?: LocationType;
  chosenDestination?: LocationType;
  imageOrigin?: any;
  imageDestiny?: any;
  additionalStops?: any;
  overviewPolyline?: any;
  showBtnLocation?: any;
};

const Map = ({
  nearby,
  chosenOrigin,
  chosenDestination,
  imageOrigin,
  imageDestiny,
  additionalStops,
  overviewPolyline,
  showBtnLocation = true,
}: MapProps) => {
  const dispatch: any = useDispatch();

  const {
    location: { coords: coordinates = null },
    user: { user = null },
  }: any = useSelector((state: any) => state);

  const [region, setRegion] = useState<LocationType>({
    latitude: chosenOrigin?.latitude || 0,
    longitude: chosenOrigin?.longitude || 0,
    latitudeDelta: chosenOrigin?.latitudeDelta || 0,
    longitudeDelta: chosenOrigin?.longitudeDelta || 0,
  });

  const [destination, setDestination] = useState<null | LocationType>(null);
  const mapViewRef = useRef<MapView>(null);
  const [listDrivers, setListDrivers] = useState<any>([]);

  useEffect(() => {
    if (coordinates && coordinates?.latitude !== 0) {
      setRegion({
        latitude: coordinates?.latitude || 0,
        longitude: coordinates?.longitude || 0,
        latitudeDelta: 0.0143,
        longitudeDelta: 0.0134,
      });
    }
  }, [coordinates?.latitude]);

  useEffect(() => {
    if (chosenOrigin) {
      if (chosenOrigin?.details?.geometry) {
        const {
          location: { lat: latitude, lng: longitude },
        } = chosenOrigin?.details?.geometry;

        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0143,
          longitudeDelta: 0.0134,
        });
        return;
      }

      setRegion(chosenOrigin);
      return;
    }
    getCurrentPosition()
      .then((response: any) => {
        setRegion(response);
      })
      .catch(err => {
        console.log('fail getCurrentPosition', err);
      });
  }, [chosenOrigin]);

  useEffect(() => {
    if (chosenDestination) {
      const { latitude, longitude } = chosenDestination;

      setDestination({
        latitude,
        longitude,
        latitudeDelta: 0.0143,
        longitudeDelta: 0.0134,
      });
    }
  }, [chosenDestination]);

  useFocusEffect(
    useCallback(() => {
      if (
        nearby === true &&
        region?.latitude &&
        region?.longitude &&
        region?.latitude !== 0 &&
        region?.longitude !== 0
      ) {
        nearbyDrivers(region?.latitude, region?.longitude).then(
          (result: any) => {
            if (result && Array.isArray(result) && result.length > 0) {
              setListDrivers(result);
            } else {
              setListDrivers([]);
            }
          },
        );

        if (!chosenOrigin && !chosenDestination) {
          setLinkToFranchise(region?.latitude, region?.longitude);
        }
      }
    }, [nearby, region?.latitude, region?.longitude]),
  );

  const myLocation = () => {
    Geolocation.getCurrentPosition(
      result => {
        const {
          coords: { latitude, longitude },
        } = result;

        mapViewRef.current?.animateToRegion({
          ...region,
          latitude,
          longitude,
        });
      },
      () => {
        //
      },
      {
        timeout: 20000,
        enableHighAccuracy: true,
        maximumAge: 1000,
        accuracy: {
          android: 'high',
          ios: 'nearestTenMeters',
        },
      },
    );
  };

  // vincular a uma franquia
  const setLinkToFranchise = async (latitude: number, longitude: number) => {
    if (user?.passenger) {
      const respLink = await linkToFranchise(
        user?.person,
        user?.passenger,
        latitude,
        longitude,
      );

      if (respLink && respLink._id) {
        user.franchise = respLink._id;

        if (user.passenger) {
          user.passenger.franchise = respLink._id;
        }

        if (user.person) {
          user.person.franchise = respLink._id;
        }

        dispatch(
          setUser({
            user: user,
          }),
        );
      }
    }
  };

  return (
    <>
      {region?.latitude === 0 || region?.longitude === 0 ? (
        <ContainerLoad>
          <Load size={'large'} color={Colors.PRIMARY} />
          <LoadText>Aguarde ...</LoadText>
        </ContainerLoad>
      ) : null}

      {region && region?.latitude !== 0 && region?.longitude !== 0 ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: region?.latitude,
            longitude: region?.longitude,
            latitudeDelta: region?.latitudeDelta,
            longitudeDelta: region?.longitudeDelta,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          followsUserLocation={true}
          showsPointsOfInterest={true}
          showsCompass={false}
          loadingEnabled={true}
          loadingIndicatorColor={Colors.PRIMARY}
          rotateEnabled={false}
          ref={mapViewRef}>
          {destination && destination?.latitude ? (
            <>
              {chosenOrigin &&
                chosenOrigin?.latitude &&
                destination &&
                destination?.latitude &&
                overviewPolyline &&
                Array.isArray(overviewPolyline) &&
                overviewPolyline.length > 0 ? (
                <Polyline
                  coordinates={overviewPolyline}
                  strokeColor={Colors.BLACK}
                  strokeWidth={3}
                />
              ) : null}

              <Marker coordinate={destination} anchor={{ x: 0.5, y: 1 }}>
                <CustomMarker image={imageDestiny} />
              </Marker>

              {chosenOrigin && chosenOrigin?.latitude ? (
                <Marker
                  coordinate={{
                    latitude: chosenOrigin.latitude,
                    longitude: chosenOrigin.longitude,
                  }}
                  anchor={{ x: 0.5, y: 1 }}>
                  <CustomMarker image={imageOrigin} />
                </Marker>
              ) : null}

              {imageDestiny &&
                additionalStops &&
                Array.isArray(additionalStops) &&
                additionalStops.length > 0 &&
                additionalStops[0]?.latitude &&
                additionalStops[0]?.longitude
                ? additionalStops.map((item: any) => {
                  return (
                    <Marker
                      key={`${Math.random()}`}
                      coordinate={{
                        latitude: item?.latitude || 0,
                        longitude: item?.longitude || 0,
                      }}
                      anchor={{ x: 0.5, y: 1 }}>
                      <CustomMarker image={imageDestiny} />
                    </Marker>
                  );
                })
                : null}
            </>
          ) : null}

          {/* carros disponiveis no momento */}
          {listDrivers && Array.isArray(listDrivers) && listDrivers.length > 0
            ? listDrivers.map((item: any) => {
              return (
                <Marker
                  key={item?._id || `${Math.random()}`}
                  coordinate={{
                    latitude: item?.location?.coordinates[1] || 0,
                    longitude: item?.location?.coordinates[0] || 0,
                  }}>
                  <CustomMarker image={CarImg} />
                </Marker>
              );
            })
            : null}
        </MapView>
      ) : null}

      {showBtnLocation && region.latitude !== 0 ? (
        <ButtonLocation onPress={() => myLocation()}>
          <Icon name="my-location" size={25} />
        </ButtonLocation>
      ) : null}
    </>
  );
};

export default memo(Map);
