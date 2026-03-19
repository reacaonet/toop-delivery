/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useState, useCallback } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { useSelector } from 'react-redux';

/** Service */
import { googleSearchAddres } from '../../../services/provider/google/geocoderService';
import { createDestination } from '../../../services/provider/chosenDestinations/createDestinations';

/** Style */
import {
  styles,
  Container,
  Header,
  IconContainer,
  Title,
  ContentLoad,
  ContainerBtn,
  BtnConfirm,
  TextBtn,
} from './styles';
import { Colors } from '../../../styles';
import imgLocation from '../../../assets/images/maps/marker_destiny.png';

const MapDestinations = ({ navigation }: any) => {
  const route = useRoute<any>();
  const {
    authUser: { user = null },
  }: any = useSelector((state: any) => state);

  const mapRef = useRef<any>(null);
  const [region, setRegion] = useState<any>(null);
  const [load, setLoad] = useState(false);
  const [address, setAddress] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (route.params?.geo?.place_id) {
        searchAddress(route.params?.geo?.place_id);
      }

      if (route.params?.geo?.addressRoute) {
        setAddress(route.params?.geo?.addressRoute);
      }
    }, [route.params?.geo?.place_id]),
  );

  useFocusEffect(
    useCallback(() => {
      if (route.params?.location && route.params?.location?.latitude) {
        setAddress(route.params?.location?.address);

        console.log('modificado a regiao', {
          latitude: route.params?.location?.latitude,
          longitude: route.params?.location?.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setRegion({
          latitude: route.params?.location?.latitude,
          longitude: route.params?.location?.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    }, [route.params?.location]),
  );

  const searchAddress = async (place_id: string) => {
    const response: any = await googleSearchAddres(`place_id=${place_id}`);
    if (response && response.length > 0) {
      setRegion({
        latitude: response[0]?.geometry?.location?.lat,
        longitude: response[0]?.geometry?.location?.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const changeRegion = (newRegion: any) => {
    mapRef.current?.animateCamera(
      {
        center: {
          latitude: newRegion?.latitude,
          longitude: newRegion?.longitude,
        },
        zoom: 16,
      },
      {
        duration: 500,
      },
    );
  };

  const confirm = async () => {
    if (!region?.latitude || !region?.longitude) {
      return Alert.alert('Mapa', 'Informe um endereço válido');
    }

    const payload = {
      latitude: region?.latitude,
      longitude: region?.longitude,
      address,
      driver: user?._id,
    };

    setLoad(true);
    const response = await createDestination(payload);
    setLoad(false);

    if (response && response.errMessage) {
      return Alert.alert('Mapa', response.errMessage);
    }

    return navigation.navigate('DriverMap');
  };

  return (
    <Container>
      <Header>
        <IconContainer
          onPress={() => navigation.navigate('ChosenDestinations')}>
          <Icon name="keyboard-arrow-left" size={45} color={Colors.PRIMARY} />
        </IconContainer>
        <Title>Definir destino</Title>
      </Header>

      {region?.latitude && region?.longitude ? (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          scrollEnabled={true}
          style={styles.map}
          initialRegion={region}>
          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            image={imgLocation}
            draggable={true}
            onDragEnd={event => {
              if (event?.nativeEvent?.coordinate) {
                changeRegion(event?.nativeEvent?.coordinate);
              }
            }}
          />
        </MapView>
      ) : (
        <ContentLoad>
          <ActivityIndicator size={'small'} color={Colors.PRIMARY} />
        </ContentLoad>
      )}

      <ContainerBtn>
        <BtnConfirm onPress={() => confirm()} disabled={load}>
          {!load ? (
            <TextBtn>Confirmar</TextBtn>
          ) : (
            <ActivityIndicator size={'small'} color={Colors.WHITE} />
          )}
        </BtnConfirm>
      </ContainerBtn>
    </Container>
  );
};

export default MapDestinations;
