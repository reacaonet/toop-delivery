/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useState, useCallback } from 'react';
import { Alert, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';

/** Service */
import {
  googlePlaceAutoComplete,
  googleSearchAddres,
} from '../../services/provider/google/geocoderService';

/** Style */
import {
  styles,
  Container,
  Header,
  Title,
  IconContainer,
  InputAddress,
  Content,
  ListContent,
  ListIconView,
  ListContentTitle,
  ListTitle,
  ListContentSearch,
  FlatContent,
  AddressRoute,
  AddressComplement,
  ContentLoad,
} from './styles';
import { Colors } from '../../styles';

var timer: any = null;

const ChosenDestinations = ({ navigation }: any) => {
  const { driverLocation }: any = useSelector((state: any) => state);

  const [isSearch, setIsSearch] = useState(false);
  const [load, setLoad] = useState(false);
  const [loadMap, setLoadMap] = useState(false);
  const [address, setAddress] = useState('');
  const [listSearchAddress, setListSearchAddress] = useState([]);

  useFocusEffect(
    useCallback(() => {
      if (address) {
        if (address.length <= 3) {
          return;
        }

        setIsSearch(true);
        clearTimeout(timer);
        timer = setTimeout(() => {
          searchList();
        }, 700);
      } else {
        setIsSearch(false);
      }
    }, [address]),
  );

  const searchList = async () => {
    setLoad(true);
    let resultAddress: any = await googlePlaceAutoComplete(
      address,
      driverLocation?.location,
    );
    setLoad(false);

    if (resultAddress && resultAddress.error && resultAddress.code === 2) {
      Alert.alert('Ooops', 'Falha ao buscar. Verifique sua conexão ...');
      return;
    }

    if (
      resultAddress !== undefined &&
      resultAddress !== null &&
      !resultAddress.error &&
      resultAddress.length > 0
    ) {
      setListSearchAddress(resultAddress);
    } else {
      setListSearchAddress([]);
    }
  };

  const openMap = async () => {
    if (!driverLocation?.location) {
      return Alert.alert(
        'Mapa',
        'Ative sua localização e de permissão para acesso',
      );
    }

    const response: any = await googleSearchAddres(
      null,
      driverLocation?.location?.latitude,
      driverLocation?.location?.longitude,
    );

    if (!response || response.length <= 0) {
      return Alert.alert('Mapa', 'Localização não encontrada');
    }

    navigation.navigate('MapDestinations', {
      location: {
        latitude: driverLocation?.location?.latitude,
        longitude: driverLocation?.location?.longitude,
        address: response[0]?.addressComplement,
      },
    });
  };

  return (
    <Container>
      <Header>
        <IconContainer
          onPress={() => {
            navigation.navigate('DriverMap');
          }}>
          <Icon name="keyboard-arrow-left" size={45} color={Colors.PRIMARY} />
        </IconContainer>
        <Title>Definir destino</Title>
      </Header>

      <InputAddress value={address} onChangeText={setAddress} />

      <Content>
        {!isSearch ? (
          <ListContent onPress={() => openMap()}>
            <ListIconView>
              <Icon name="place" size={40} color={Colors.PRIMARY} />
            </ListIconView>
            <ListContentTitle>
              <ListTitle>Definir no mapa</ListTitle>
            </ListContentTitle>
          </ListContent>
        ) : null}

        {isSearch ? (
          <ListContentSearch>
            {load ? (
              <ContentLoad>
                <ActivityIndicator size={'small'} color={Colors.PRIMARY} />
              </ContentLoad>
            ) : (
              <FlatList
                data={listSearchAddress}
                keyExtractor={(item: any) =>
                  `${item.place_id || Math.random()}`
                }
                contentContainerStyle={styles.flatStyle}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <FlatContent
                    onPress={() =>
                      navigation.navigate('MapDestinations', {
                        geo: item,
                      })
                    }>
                    <AddressRoute>{item?.addressRoute}</AddressRoute>
                    <AddressComplement>
                      {item?.addressComplement}
                    </AddressComplement>
                  </FlatContent>
                )}
              />
            )}
          </ListContentSearch>
        ) : null}
      </Content>
    </Container>
  );
};

export default ChosenDestinations;
