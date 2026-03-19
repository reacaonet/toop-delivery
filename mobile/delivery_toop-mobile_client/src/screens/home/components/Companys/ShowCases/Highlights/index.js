/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';

import {isAuthenticated} from '../../../../../../services/userAuth';
import {listCompanyHighlights} from '../../../../../../services/service/company';
import {seacrhDeliveryAddress} from '../../../../../../services/service/delivery/address';

import {fixedNumbers} from '../../components/functions';

import styles from '../../styles';
import stylesHighlights from './styles';

const CompanyHighlights = ({hr, category}) => {
  const navigation = useNavigation();
  const [companies, setCompanies] = useState([]);
  const hrActive = hr !== false ? true : false;

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

  const getAddressAndRedirectOurShow = useCallback(async () => {
    const {user} = await isAuthenticated();

    const addressMain = await seacrhDeliveryAddress({
      customer: user._id,
      main: true,
    });

    if (!addressMain || addressMain.length <= 0) {
      return;
    }

    listCompanys(addressMain[0]);
  }, [listCompanys, category]);

  const listCompanys = useCallback(
    async address => {
      const location = address.location.coordinates;

      const getListCompanys = await listCompanyHighlights({
        latitude: location[1],
        longitude: location[0],
        category: category,
      });

      if (getListCompanys && getListCompanys.length > 0) {
        setCompanies(getListCompanys);
      } else {
        setCompanies([]);
      }
    },
    [category],
  );

  useEffect(() => {
    getAddressAndRedirectOurShow();
  }, [getAddressAndRedirectOurShow]);

  return companies && Object.keys(companies).length > 0 ? (
    <View style={stylesHighlights.BoxIndicated}>
      <Text style={styles.Title}>Destaques</Text>
      <ScrollView
        horizontal
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        {companies.map(company => (
          <TouchableOpacity
            style={[stylesHighlights.BoxMax]}
            key={company._id}
            onPress={() => goProducts(company)}>
            <FastImage
              source={{
                uri: company.images[0],
                priority: FastImage.priority.normal,
              }}
              style={stylesHighlights.Brand}
              resizeMode={FastImage.resizeMode.contain}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  ) : null;
};

export default CompanyHighlights;
