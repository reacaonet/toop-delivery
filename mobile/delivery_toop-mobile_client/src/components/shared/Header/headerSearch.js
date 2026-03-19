/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useCallback, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { isAuthenticated } from '../../../services/userAuth';
import {
  seacrhDeliveryAddress,
  createDeliveryAddress,
} from '../../../services/service/delivery/address';
import LocationCurrent from '../../../services/location/locationCurrent';
import { googleSearchAddres } from '../../../services/maps/geocoderService';

/** Util */
import { replaceSpecialChars } from '../../../utils';

import styles from './styles';
import { useSelector } from 'react-redux';

const HeaderSearch = ({ navigation }) => {
  const [address, setAddress] = useState('');
  const {
    tab: { category = 'delivery' },
  } = useSelector(state => state);

  const formatAddress = addressFormat => {
    if (addressFormat && addressFormat.length > 5) {
      try {
        return addressFormat.substr(0, 40).split(' - ', 1)[0];
      } catch (err) {
        return addressFormat.substr(0, 40);
      }
    }
  };

  const screenLocation = useCallback(() => {
    navigation.navigate('Customer', {
      screen: 'CustomerAddress',
    });

    console.log('indo para setar endereço ....');
  }, []);

  useEffect(() => {
    const validateLocation = async () => {
      const response = await isAuthenticated();
      const addressUser = await seacrhDeliveryAddress({
        customer: response.user._id,
        main: true,
      });

      if (!addressUser || addressUser.length === 0) {
        const result = await LocationCurrent().getLocation();

        if (!result || !result?.latitude || !result?.longitude) {
          return screenLocation();
        }

        const respAddress = await googleSearchAddres(
          null,
          result?.latitude,
          result?.longitude,
        );

        if (
          !respAddress ||
          !Array.isArray(respAddress) ||
          respAddress.length <= 0
        ) {
          return screenLocation();
        }

        // Cadastrar aqui o novo endereço
        const currentLocation = respAddress[0];
        const formatedNumber = replaceSpecialChars(
          currentLocation?.streetNumber,
        );

        const payload = {
          customer: response.user._id,
          formatedNumber,
          complement: '',
          referencePoint: '',
          category: 'HOME',
          address: currentLocation?.formatted_address,
          addressRoute: `${currentLocation?.addressRoute}`.replace(',', ''),
          addressRegion: `${currentLocation?.addressComplement || ''}`,
          latitude: currentLocation?.geometry?.location?.lat,
          longitude: currentLocation?.geometry?.location?.lng,
          city: `${currentLocation?.city}`,
          district: '',
          streetNumber: `${formatedNumber}`,
          country: `${currentLocation?.country}`,
          state: `${currentLocation?.state}`,
          zipcode: `${currentLocation?.zipcode}`,
        };

        const createAddress = await createDeliveryAddress(payload);

        if (!createAddress || !createAddress._id) {
          return screenLocation();
        }

        let strAddress = createAddress.address;

        if (createAddress.addressRoute) {
          strAddress = createAddress.addressRoute;

          if (createAddress.streetNumber) {
            strAddress += ` ${createAddress?.streetNumber}`;
          }
        }

        setAddress(formatAddress(strAddress));
      } else {
        let strAddress = addressUser[0]?.address;

        if (
          addressUser[0]?.addressRoute &&
          addressUser[0]?.addressRoute.length > 3
        ) {
          strAddress = addressUser[0].addressRoute;

          if (addressUser[0]?.streetNumber) {
            strAddress += ` ${addressUser[0]?.streetNumber}`;
          }
        }

        setAddress(formatAddress(strAddress));
      }
    };

    validateLocation();
  }, [screenLocation]);

  return (
    category == 'delivery' ? (
      <TouchableOpacity style={styles.address} onPress={() => screenLocation()}>
        {address ? (
          <View style={styles.container}>
            <Text style={styles.txtAddress} numberOfLines={1}>
              {address}
            </Text>
            <Icon name="place" size={20} style={styles.placeIcon} />
          </View>
        ) : (
          <>
            <Text style={styles.txtAddress} numberOfLines={1}>
              Adicionar Endereço
            </Text>
            <Icon
              name="place"
              size={20}
              style={[styles.placeIcon, styles.disabled]}
            />
          </>
        )}
      </TouchableOpacity>
    ) : (
      null
    )
  );
};

export default HeaderSearch;
