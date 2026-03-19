import React, { useState, useCallback, useRef } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import MapView from 'react-native-maps';
import { useSelector } from 'react-redux';

/** styles */
import {
  styles,
  Container,
  ContainerLoad,
  Load,
  LoadText,
  ContentMarker,
  MakerInfoView,
  MarkerInfoText,
  BtnConfirm,
  BtnConfirmText,
} from './styles';
import { Colors } from '../../../../../../../styles';

/** Components */
import CustomMarker from '../../../../../../../components/Map/components/CustomMarker';

/** Service */
import { geoCode } from '../../../../../../../services/provider/maps/geoCode';

const SelectInMap = ({ nextConfirm }: any) => {
  const {
    location: { coords: coordinates = null },
    user: { user = null },
  }: any = useSelector((state: any) => state);

  const touchMove = useRef(false);
  const mapViewRef = useRef<any>(null);
  const [region, setRegion] = useState<any>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const coordinatesSelected = useRef<any>();
  const [load, setLoad] = useState<Boolean>(false);

  useFocusEffect(
    useCallback(() => {
      if (coordinates?.latitude !== 0 && coordinates?.longitude !== 0) {
        if (!coordinatesSelected.current) {
          coordinatesSelected.current = {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          };
        }

        setRegion({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          latitudeDelta: 0.0143,
          longitudeDelta: 0.0134,
        });
      }
    }, [coordinates?.latitude, coordinates?.longitude]),
  );

  const changeCoordinate = (coords: any) => {
    if (touchMove.current === false) {
      return;
    }

    mapViewRef.current?.animateToRegion({
      ...region,
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: coords.latitudeDelta,
      longitudeDelta: coords.longitudeDelta,
    });

    touchMove.current = false;
    coordinatesSelected.current = {
      latitude: coords.latitude,
      longitude: coords.longitude,
    };
  };

  const sendCurrentLocation = async () => {
    try {
      setLoad(true);

      const respGeocode = await geoCode({
        latitude: coordinatesSelected.current?.latitude,
        longitude: coordinatesSelected.current?.longitude,
      });

      setLoad(false);

      if (respGeocode && respGeocode.errMessage) {
        return Alert.alert('Endereço', respGeocode.errMessage);
      }

      nextConfirm({
        data: {
          structured_formatting: {
            main_text: respGeocode?.shortAddress || respGeocode?.address,
          },
        },
        detail: {
          formatted_address: respGeocode?.address || '',
          geometry: {
            location: {
              lat: respGeocode?.latitude || 0,
              lng: respGeocode?.longitude || 0,
            },
          },
        },
      });
    } catch (err) {
      setLoad(false);
    }
  };

  return (
    <Container>
      {region.latitude === 0 || region.longitude === 0 ? (
        <ContainerLoad>
          <Load size={'large'} color={Colors.PRIMARY} />
          <LoadText>Aguarde ...</LoadText>
        </ContainerLoad>
      ) : null}

      {region.latitude !== 0 && region.longitude !== 0 ? (
        <>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: region.latitude,
              longitude: region.longitude,
              latitudeDelta: region.latitudeDelta,
              longitudeDelta: region.longitudeDelta,
            }}
            loadingEnabled={true}
            zoomControlEnabled={true}
            ref={mapViewRef}
            onRegionChangeComplete={coords => {
              changeCoordinate(coords);
            }}
            onTouchMove={() => {
              if (touchMove.current === false) {
                touchMove.current = true;
              }
            }}
            rotateEnabled
          />
          <ContentMarker pointerEvents={'none'}>
            <MakerInfoView>
              <MarkerInfoText>Selecione o local</MarkerInfoText>
            </MakerInfoView>
            <CustomMarker />
          </ContentMarker>

          <BtnConfirm onPress={() => sendCurrentLocation()} disabled={load}>
            {!load ? (
              <BtnConfirmText>Confirmar</BtnConfirmText>
            ) : (
              <ActivityIndicator color={Colors.WHITE} size={'small'} />
            )}
          </BtnConfirm>
        </>
      ) : null}
    </Container>
  );
};

export default SelectInMap;
