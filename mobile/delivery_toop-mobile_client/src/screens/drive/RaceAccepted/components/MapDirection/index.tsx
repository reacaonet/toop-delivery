/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useCallback, memo } from 'react';
import MapView, { Marker, MarkerAnimated, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/core';
import { isNumber } from '@turf/turf';
import moment from 'moment';

/** Service */
import { getDirection } from '../../../../../services/provider/maps/directions';
import { lastPositions } from '../../../../../services/provider/driver/lastPositions';

/** Util */
import { getStepCurrent, getBearing } from '../../../../../utils/direction';
import { sleep } from '../../../../../utils';

/** Styles */
import { styles, ContainerLoad, Load } from './styles';
import { Colors } from '../../../../../styles';


/** Images */
import markerCar from '../../../../../assets/images/map/car.png';
import markerDestiny from '../../../../../assets/images/map/marker_destiny.png';

const MapDirection = ({ origin, destiny, user, booking, setDuration, additionalStops }: any) => {
  const [region, setRegion] = useState<any>({
    latitude: origin.latitude,
    longitude: origin.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [rotation, setRotation] = useState<null | Number>(0);
  const mapViewRef = useRef<MapView>(null);
  const markerCarRef = useRef<MarkerAnimated | any>();
  const [polyline, setPolyline] = useState<any>(null);
  const listCoords = useRef<any>(null);
  const listSteps = useRef<any>(null);
  const eventFollow = useRef<any>(null);
  const eventTime = useRef<any>(null);
  const idPointer = useRef<string | null>(null);
  const driverOldPosition = useRef<any>(null);
  const isRunning = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (
        origin?.latitude &&
        destiny?.latitude &&
        destiny?.latitude &&
        destiny?.longitude &&
        booking?.driver?._id
      ) {
        getListCoords(origin);
        vehicleTraveling();
        getDuration();
      }

      return () => {
        try {
          if (eventFollow.current && eventFollow.current !== null) {
            // console.log('limpando evento eventFollow ... ', eventFollow.current);
            clearInterval(eventFollow.current);
            eventFollow.current = null;
            isRunning.current = false;
          }

          if (
            eventTime.current &&
            eventTime.current !== null) {
            clearInterval(eventTime.current);
            eventTime.current = null;
          }
        } catch (err) { }
      };
    }, [
      origin?.latitude,
      origin?.longitude,
      destiny?.latitude,
      destiny?.longitude,
      user?._id,
      booking?.driver?._id,
    ]),
  );

  const getListCoords = async (first: any) => {
    try {
      if (
        first?.latitude &&
        first?.longitude &&
        destiny?.latitude &&
        destiny?.longitude &&
        user?._id
      ) {
        let listAdditionalStops = '';
        if (
          additionalStops &&
          Array.isArray(additionalStops) &&
          additionalStops.length > 0
        ) {
          additionalStops.map((item: any) => {
            listAdditionalStops += `${item?.latitude || 0},${item?.longitude || 0
              }|`;
          });
        }

        const respDirection: any = await getDirection({
          passengerId: user?.passenger?._id,
          origin: `${first.latitude},${first.longitude}`,
          destiny: `${destiny.latitude},${destiny.longitude}`,
          additionalStops: listAdditionalStops,
        });

        if (
          respDirection &&
          respDirection?.coords &&
          Array.isArray(respDirection?.coords) &&
          respDirection?.coords.length > 0
        ) {
          listCoords.current = respDirection.coords;
          setPolyline(respDirection.coords);
        } else {
          setPolyline(null);
        }

        if (respDirection?.duration) {
          setDuration(respDirection.duration);
        }

        if (
          respDirection?.steps &&
          Array.isArray(respDirection.steps) &&
          respDirection.steps.length > 0
        ) {
          listSteps.current = respDirection.steps;
          let step = respDirection.steps[0];
          if (
            step?.start_location &&
            step?.end_location &&
            step?.end_location?.lat
          ) {
            let angle: any = getBearing(
              {
                latitude: step?.start_location?.lat,
                longitude: step?.start_location?.lng,
              },
              {
                latitude: step?.end_location?.lat,
                longitude: step?.end_location?.lng,
              },
            );

            if (angle !== null && isNumber(angle)) {
              setRotation(90 - angle);
            }
          }
        }
      }
    } catch (err) {
      console.log('fail', err);
    }
  };

  const getCoordDestiny = () => {
    try {
      return {
        latitude: destiny.latitude,
        longitude: destiny.longitude,
      };
    } catch (err) {
      return {
        latitude: origin.latitude,
        longitude: origin.longitude,
      };
    }
  };

  const vehicleTraveling = async () => {
    if (eventFollow.current !== null) {
      return;
    }

    eventFollow.current = setInterval(Traveling, 5000);
  };

  const Traveling = async () => {
    try {
      if (isRunning.current === true) {
        return;
      }

      let queryParams: any = {};

      if (idPointer.current !== null) {
        queryParams.idPointer = idPointer.current;
      }

      isRunning.current = true;
      console.log('Iniciar Pesquisa lastPositions: ', moment().format('HH:mm:ss'), 'payload', queryParams);
      const lastP = await lastPositions(booking?.driver?._id, queryParams);

      if (!lastP || !Array.isArray(lastP) || lastP.length <= 0) {
        isRunning.current = false;
        return;
      }

      if (
        lastP.length === 1 &&
        lastP[0].location?.latitude === region.latitude
      ) {
        idPointer.current = lastP[0]._id;
        isRunning.current = false;
        return;
      }

      let index = 0;

      // console.log('lastP', lastP);
      console.log('Inicio For: ', `Total: ${lastP.length}`, moment().format('HH:mm:ss'));
      for await (const position of lastP) {
        // console.log('Posição: ', position);

        let payload = position.location;
        idPointer.current = position._id;

        if (
          driverOldPosition?.current !== null &&
          driverOldPosition?.current?.latitude === payload?.latitude
        ) {
          continue;
        }

        let angle: any = null;

        if (index > 0) {
          angle = getBearing(lastP[index - 1].location, payload);
        } else if (
          driverOldPosition.current !== null &&
          driverOldPosition.current?.latitude
        ) {
          angle = getBearing(driverOldPosition.current, payload);
        }

        if (angle !== null && isNumber(angle) && angle !== 0) {
          setTimeout(() => {
            setRotation(90 - angle);
          }, 650);
        }

        markerCarRef.current?.animateMarkerToCoordinate(payload, 1500); // Modificar posição e anglo do ícone
        driverOldPosition.current = position.location;
        index++;

        await sleep(1.5); // [Em segundos] deve ser o mesmo tempo da animação
      }
      console.log('Fim For: ', moment().format('HH:mm:ss'));
      isRunning.current = false;

      if (driverOldPosition.current !== null) {
        // centralizar o Mapa
        mapViewRef.current?.animateToRegion(
          {
            ...region,
            ...driverOldPosition.current,
          },
          1500,
        );
      }

      // Duracao da viagem - inicio
      if (
        listSteps.current &&
        Array.isArray(listSteps.current) &&
        driverOldPosition.current !== null
      ) {
        let respStep: any = null;
        respStep = await getStepCurrent(
          listSteps.current,
          driverOldPosition.current,
        );

        if (respStep && respStep?.duration) {
          setDuration(respStep.duration);

          if (respStep?.angle && respStep?.angle !== 0) {
            // setRotation(90 - respStep?.angle);
          }
        } else if (!respStep || respStep?.duration === null) {
          // getListCoords(driverOldPosition.current);
        }
      }
      // duracao da viagem - fim

      console.log('--------------------------------------');
    } catch (err) {
      isRunning.current = false;
      console.log('err setInterval vehicleTraveling', err);
    }
  };

  const getDuration = () => {
    if (eventTime.current !== null) {
      return;
    }

    eventTime.current = setInterval(() => {
      if (driverOldPosition.current) {
        console.log('eventTime getListCoords .....');
        getListCoords(driverOldPosition.current);
      }
    }, 45000);
  };


  return (
    <>
      {region?.latitude && region?.longitude ? (
        <MapView
          ref={mapViewRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: region.latitude,
            longitude: region.longitude,
            latitudeDelta: region.latitudeDelta,
            longitudeDelta: region.longitudeDelta,
          }}
          rotateEnabled={false}
          loadingEnabled>
          <MarkerAnimated
            ref={markerCarRef}
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            image={markerCar}
            style={[styles.iconDimesion,
            {
              transform: [
                {
                  rotate: `${rotation}deg`,
                },
              ],
            },
            ]}
          />

          {region?.latitude && destiny?.latitude && user?._id ? (
            <>
              {polyline && Array.isArray(polyline) && polyline.length > 0 ? (
                <Polyline coordinates={polyline} strokeColor={Colors.DARK} strokeWidth={3} />
              ) : null}

              <Marker
                coordinate={getCoordDestiny()}
                image={markerDestiny}
                style={styles.iconDimesion}
              />

              {additionalStops &&
                Array.isArray(additionalStops) &&
                additionalStops.length > 0
                ? additionalStops.map((item: any) => {
                  return (
                    <Marker
                      key={`${Math.random()}`}
                      coordinate={item}
                      image={markerDestiny}
                      style={styles.iconDimesion}
                    />
                  );
                }) : null}
            </>
          ) : null}

        </MapView>
      ) : (
        <ContainerLoad>
          <Load />
        </ContainerLoad>
      )}
    </>
  );
};

export default memo(MapDirection);
