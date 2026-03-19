import React, { useState, useCallback, useRef } from 'react';
import { ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import MapView from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

/** styles */
import {
  styles,
  Container,
  Header,
  MenuButton,
  HeaderTitle,
  Divider,
  ContainerLoad,
  Load,
  LoadText,
  ContentMarker,
  MakerInfoView,
  MarkerInfoText,
  BtnConfirm,
  BtnConfirmText,
} from './styles';
import { Colors } from '../../../../../styles';

/** Components */
import { CustomMarker } from '../../../../../components/Map/components/CustomMarker';

/** Service */
import { geoCode } from '../../../../../services/provider/maps/geoCode';
import { t } from 'i18next';

const PlaceMap = ({ currentPlace, visibleModal, onClick, goBack }: any) => {
  const { coordinates }: any = useSelector((state: any) => state);

  const touchMove = useRef(false);
  const mapViewRef = useRef<any>(null);
  const [region, setRegion] = useState<any>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
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
    }, [coordinates, coordinates?.latitude, coordinates?.longitude]),
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
      if (!coordinatesSelected.current) {
        return Alert.alert(t('alert.address'), t('alert.dontAddress'));
      }

      setLoad(true);
      const respGeocode = await geoCode({
        latitude: coordinatesSelected.current?.latitude,
        longitude: coordinatesSelected.current?.longitude,
      });
      setLoad(false);

      if (respGeocode && respGeocode.errMessage) {
        return Alert.alert(t('alert.address'), respGeocode.errMessage);
      }

      onClick(
        {
          formatted_address: respGeocode?.address || '',
          geometry: {
            location: {
              lat: respGeocode?.latitude || 0,
              lng: respGeocode?.longitude || 0,
            },
          },
        },
        currentPlace?.type,
        respGeocode?.shortAddress || respGeocode?.address,
        currentPlace.index,
      );

      visibleModal(false);
      goBack();
    } catch (err) {
      setLoad(false);
    }
  };

  return (
    <Container>
      <Header>
        <MenuButton onPress={() => goBack()}>
          <Icon name="navigate-before" size={28} color={Colors.BLACK} />
        </MenuButton>
        <HeaderTitle>Definir no mapa</HeaderTitle>
      </Header>

      <Divider />

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
            rotateEnabled={false}
          />
          <ContentMarker pointerEvents={'none'}>
            <MakerInfoView>
              <MarkerInfoText>Selecione o local</MarkerInfoText>
            </MakerInfoView>
            <CustomMarker />
          </ContentMarker>
          <SafeAreaView>
            <BtnConfirm onPress={() => sendCurrentLocation()} disabled={load}>
              {!load ? (
                <BtnConfirmText>Confirmar</BtnConfirmText>
              ) : (
                <ActivityIndicator color={Colors.WHITE} size={'small'} />
              )}
            </BtnConfirm>
          </SafeAreaView>
        </>
      ) : null}
    </Container>
  );
};

export default PlaceMap;
