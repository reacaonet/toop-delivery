/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useCallback, memo } from 'react';
import MapView, { AnimatedRegion, Marker, MarkerAnimated, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import { isNumber } from '@turf/turf';

/** Styles */
import { styles, ContainerLoad, Load } from './styles';
import { Colors } from '../../../../styles';

/* Components */
// import { Directions } from '../../../../components/Directions';

/** Services */
import { getDirection } from '../../../../services/provider/maps/directions';

/** Util */
import { getBearing } from '../../../../utils/direction';

/** Images */
// import markerCar from '../../../../assets/images/maps/gps.png';
import markerCar from '../../../../assets/images/maps/car.png';
import markerDestiny from '../../../../assets/images/maps/marker_destiny.png';


const MapDirection = ({
  origin,
  destiny,
  passenger,
  additionalStops,
  markerIcon,
  setFunction = null,
}: any) => {
  const [region, setRegion] = useState<any>({
    latitude: origin.latitude || 0,
    longitude: origin.longitude || 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [coordMarkerDriver, setCoordMarkerDriver] = useState<any>(null);

  const mapViewRef = useRef<MapView>(null);
  const [rotation, setRotation] = useState<number>(90);
  const markerCarRef = useRef<MarkerAnimated | any>();
  const totalLocation = useRef<number>(0);
  const [polyline, setPolyline] = useState(null);
  const listCoords = useRef<any>(null);
  const originOld = useRef<any>(null);
  const destinyOld = useRef<any>(null);
  const stops = useRef<any>(null);

  const coordinate = new AnimatedRegion({
    latitude: origin?.latitude,
    longitude: origin?.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useFocusEffect(
    useCallback(() => {
      if (
        origin?.latitude &&
        origin?.longitude &&
        destiny?.latitude &&
        destiny?.longitude &&
        passenger?._id
      ) {
        if (coordMarkerDriver === null) {
          setCoordMarkerDriver({
            latitude: origin?.latitude,
            longitude: origin?.longitude,
          });
        }

        if (
          totalLocation.current > 0 &&
          destinyOld.current?.latitude !== destiny?.latitude
        ) {
          destinyOld.current = destiny;
          getListCoords(origin);
        }

        calculateDirection();
      }
    }, [origin?.latitude, origin?.longitude, destiny?.latitude, destiny?.longitude, passenger?._id]),
  );

  // Paradas Adicionais
  useFocusEffect(
    useCallback(() => {
      if (
        stops.current !== null && Array.isArray(stops.current) &&
        Array.isArray(additionalStops) && stops.current.length !== additionalStops.length
      ) {
        getListCoords(origin);
      }

      stops.current = additionalStops;
    }, [additionalStops])
  );


  const getListCoords = async (first: any) => {
    try {
      if (first?.latitude && first?.longitude && destiny?.latitude && destiny?.longitude && passenger?._id) {
        let listAdditionalStops = '';
        if (additionalStops && Array.isArray(additionalStops) && additionalStops.length > 0) {
          additionalStops.map((item: any) => {
            listAdditionalStops += `${item?.latitude || 0},${item?.longitude || 0}|`;
          });
        }

        const respDirection = await getDirection({
          passengerId: passenger?._id,
          origin: `${first?.latitude},${first?.longitude}`,
          destiny: `${destiny?.latitude},${destiny?.longitude}`,
          additionalStops: listAdditionalStops,
        });

        if (respDirection && respDirection?.coords && Array.isArray(respDirection?.coords) && respDirection?.coords.length > 0) {
          listCoords.current = respDirection.coords;
          setPolyline(respDirection.coords);

          if (respDirection?.distanceMeters && setFunction && typeof setFunction === 'function') {
            setFunction({
              distance: respDirection?.distanceMeters || null,
              duration: respDirection?.duration || null,
            });
          }
        } else {
          listCoords.current = null;
          setPolyline(null);
        }
      }
    } catch (err) {
      console.log('fail direction', err);
    }
  };

  const calculateDirection = async (): Promise<any> => {
    try {
      if (origin && (origin?.latitude && origin?.latitude !== originOld?.current?.latitude)) {
        if (totalLocation.current >= 40) {
          totalLocation.current = 0;
        }

        let angle: any = null;
        if (originOld?.current?.latitude) {
          angle = getBearing(originOld?.current, origin);
        }

        originOld.current = origin;

        if (totalLocation.current === 0) {
          setRegion({
            ...region,
            latitude: origin?.latitude,
            longitude: origin?.longitude,
          });

          getListCoords(origin);
        }

        if (angle !== null && isNumber(angle) && angle !== 0) {
          setTimeout(() => {
            setRotation(90 - parseInt(angle, 10));
          }, 600);
        }

        totalLocation.current++;

        let payload: any = {
          center: {
            latitude: origin?.latitude,
            longitude: origin?.longitude,
          },
          zoom: 18,
        };

        mapViewRef.current?.animateCamera(payload, {
          duration: 500,
        });

        markerCarRef.current?.animateMarkerToCoordinate({
          latitude: payload?.center?.latitude || 0,
          longitude: payload?.center?.longitude || 0,
        }, 1000);
      }
    } catch (err) {
      console.log('fail direction', err);
    }
  };

  const getCoordDestiny = () => {
    try {
      return {
        latitude: destiny?.latitude || 0,
        longitude: destiny?.longitude || 0,
      };
    } catch (err) {
      return {
        latitude: origin?.latitude || 0,
        longitude: origin?.longitude || 0,
      };
    }
  };

  return (
    <>
      {region?.latitude && region.longitude ? (
        <MapView
          ref={mapViewRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: region.latitude || 0,
            longitude: region.longitude || 0,
            latitudeDelta: region.latitudeDelta,
            longitudeDelta: region.longitudeDelta,
          }}
          // loadingEnabled
          rotateEnabled={false}>
          {coordMarkerDriver && coordMarkerDriver?.latitude ? (
            <MarkerAnimated
              ref={markerCarRef}
              coordinate={{
                latitude: coordMarkerDriver.latitude,
                longitude: coordMarkerDriver.longitude,
              }}
              style={styles.iconDimesion}
              image={markerIcon ? { uri: markerIcon } : markerCar}
              rotation={rotation || 90}
            />
          ) : null}

          {origin?.latitude && destiny?.latitude && passenger ? (
            <>
              {polyline && Array.isArray(polyline) ? (
                <Polyline coordinates={polyline} strokeColor="#000" strokeWidth={3} />
              ) : null}

              <Marker
                coordinate={getCoordDestiny()}
                style={styles.iconDimesion}
              >
                <Image source={markerDestiny} style={styles.iconDimesion} resizeMode={'contain'} />
              </Marker>

              {additionalStops &&
                Array.isArray(additionalStops) &&
                additionalStops.length > 0
                ? additionalStops.map((item: any) => {
                  return (
                    <Marker
                      key={`${Math.random()}`}
                      coordinate={item}
                      style={styles.iconDimesion}
                    >
                      <Image source={markerDestiny} style={styles.iconDimesion} resizeMode={'contain'} />
                    </Marker>
                  );
                })
                : null}
            </>
          ) : null}
        </MapView>
      ) : (
        <ContainerLoad>
          <Load size={'large'} color={Colors.PRIMARY} />
        </ContainerLoad>
      )}
    </>
  );
};

export default memo(MapDirection);
