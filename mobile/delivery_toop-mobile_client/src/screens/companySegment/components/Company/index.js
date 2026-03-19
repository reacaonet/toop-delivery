/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import LootieView from 'lottie-react-native';
import loaderLootie from '../../../../assets/animations/loader.json';

/** Service */
import {StorageGet} from '../../../../services/deviceStorage';
import distanteFormat from '../../../../services/maps/distanceCoordinate';
import {listCompany} from '../../../../services/service/company';

import {round, formatMoney} from '../../../../utils';

/** Styles */
import styles from './styles';

const Company = ({refreshing, category, segment}) => {
  const navigation = useNavigation();
  const {configurations = null} = useSelector(state => state);
  const {t} = useTranslation();

  const [load, setLoad] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [guestAddress, setGuestAddres] = useState(null);
  const [customerAddress, setCustomerAddres] = useState(null);

  useEffect(() => {
    getCompany();
  }, [refreshing, segment, category]);

  const getCompany = async () => {
    setLoad(true);
    let respAddress = await StorageGet('@addressUser');
    let params = {};

    if (
      respAddress &&
      respAddress.location &&
      respAddress.location.coordinates
    ) {
      params.latitude = respAddress.location.coordinates[1];
      params.longitude = respAddress.location.coordinates[0];
      setCustomerAddres(respAddress);
    }

    params.segment = segment?._id;

    if (category) {
      params.category = category;
    }

    params.delivery = true;

    const resp = await listCompany(params);
    setLoad(false);

    if (!resp || resp.length <= 0) {
      return setCompanies(null);
    }

    setCompanies(resp);
  };

  const goProducts = item => {
    if (item?.shoppingFlow === 'PRODUCT') {
      return navigation.navigate('Supermarket', {
        screen: 'Product',
        params: {
          company: item,
        },
      });
    }

    return navigation.navigate('Restaurant', {
      screen: 'RestaurantProduct',
      params: {
        company: item,
      },
    });
  };

  const txtDistante = item => {
    let companyCoord = null;
    let userCoord = null;

    if (item.location && item.location.coordinates) {
      companyCoord = item.location.coordinates;
    }

    if (guestAddress && guestAddress.location) {
      userCoord = guestAddress.location.coordinates;
    } else if (
      customerAddress.location &&
      customerAddress.location.coordinates
    ) {
      userCoord = customerAddress.location.coordinates;
    }
    return companyCoord && userCoord ? (
      <Text style={styles.txtDistance}>
        {distanteFormat(
          {
            latitude: userCoord[1],
            longitude: userCoord[0],
          },
          {
            latitude: companyCoord[1],
            longitude: companyCoord[0],
          },
        )}
      </Text>
    ) : null;
  };

  const deliveryTime = item => {
    try {
      if (item && item.deliveryTime) {
        return ` Aprox. ${item.deliveryTime} Min - `;
      }

      return '';
    } catch (err) {
      return '';
    }
  };

  const deliveryPrice = price => {
    try {
      if (price > 0) {
        return ` ${formatMoney(price, configurations?.coin)}`;
      }
      return 'Grátis';
    } catch (err) {
      return '';
    }
  };

  return (
    <View>
      {load ? (
        <View style={styles.containerLoading}>
          <LootieView
            source={loaderLootie}
            style={styles.ltieView}
            resizeMode="contain"
            loop
            autoPlay
          />
        </View>
      ) : null}

      {companies === null ? (
        <View style={styles.container}>
          <Text style={styles.txtNotFound}>Nenhum resultado encontrado!!</Text>
        </View>
      ) : null}

      {load === false && companies && companies.length > 0 ? (
        <View style={styles.container}>
          {companies.map(item => (
            <TouchableOpacity
              key={item._id}
              onPress={() => goProducts(item)}
              style={styles.listView}>
              <View style={styles.BoxlistView}>
                <View style={styles.image}>
                  <FastImage
                    source={{
                      uri: item.images[0],
                      priority: FastImage.priority.normal,
                    }}
                    style={[
                      styles.image,
                      item.companyDelivery?.isOpen === false
                        ? styles.imageClosed
                        : null,
                    ]}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                  {item.companyDelivery?.isOpen === false ? (
                    <Text style={styles.textClosed}>Fechado</Text>
                  ) : null}
                </View>
                <View style={styles.listCard}>
                  <Text style={styles.txtTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.star]}>
                    <Icon name="star" />{' '}
                    {item.companyDelivery?.totalRating > 20
                      ? round(item.companyDelivery.mediaRating, 1)
                      : 'Novo'}{' '}
                    {txtDistante(item)}
                  </Text>
                  {item.deliveryPrice >= 0 ? (
                    <Text
                      style={[
                        styles.txtInfo,
                        item.deliveryPrice === 0 ? styles.infoGreen : null,
                      ]}>
                      <Icon name="motorcycle" />
                      {deliveryTime(item)}
                      {`${deliveryPrice(item.deliveryPrice)}`}
                    </Text>
                  ) : null}
                </View>
              </View>
              {item.cupom ? (
                <View style={styles.BoxFooter}>
                  <Text style={styles.TextCupom}>
                    Cupom de {configurations?.coin} {item.cupom} disponível
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default Company;
