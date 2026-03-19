/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useCallback} from 'react';
import {Text} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

/** Service */
import {listSlider} from '../../../../services/service/slider';
import {StorageGet} from '../../../../services/deviceStorage';

/** Util */
import {formatMoney} from '../../../../utils';

/** Styles */
import {
  Container,
  ListBanner,
  ContainerRender,
  ContentTextView,
  CompanyImageView,
  styles,
} from './styles';

const Banner = ({}) => {
  const {configurations = null} = useSelector(state => state);
  const navigation = useNavigation();
  const [listBanner, setListBanner] = useState([]);

  useEffect(() => {
    getBanner();
  }, []);

  const getBanner = async () => {
    let respAddress = await StorageGet('@addressUser');

    let params = {
      type: 'banner',
    };

    if (
      respAddress &&
      respAddress.location &&
      respAddress.location.coordinates
    ) {
      params.latitude = respAddress.location.coordinates[1];
      params.longitude = respAddress.location.coordinates[0];
    }

    const result = await listSlider(params);
    if (result) {
      setListBanner(result);
    }
  };

  const bannerClick = useCallback(
    async banner => {
      let companyType = banner?.company?.shoppingFlow || null;
      let companyId = banner?.company?._id || null;
      let companyClick = banner?.companyClick || null;
      let productId = banner?.productId || null;

      if (productId && companyType) {
        if (companyType === 'PRODUCT') {
          return supermarketProductDetail(banner.company, productId);
        } else if (companyType === 'MENU') {
          return restaurantProductDetail(banner.company, productId);
        }
      }

      if (companyClick === true && companyId && companyType === 'PRODUCT') {
        return supermarketProduct(banner.company);
      } else if (companyClick === true && companyId && companyType === 'MENU') {
        return restaurantProduct(banner.company);
      }
    },
    [
      restaurantProduct,
      restaurantProductDetail,
      supermarketProduct,
      supermarketProductDetail,
    ],
  );

  const supermarketProduct = useCallback(company => {
    return navigation.navigate('Supermarket', {
      screen: 'Product',
      params: {
        company: company,
      },
    });
  }, []);

  const supermarketProductDetail = (company, productId) => {
    return navigation.navigate('Supermarket', {
      screen: 'ProductDetails',
      params: {
        idProduct: productId,
        company: company,
        goBack: 'Supermarket',
      },
    });
  };

  const restaurantProduct = company => {
    return navigation.navigate('Restaurant', {
      screen: 'RestaurantProduct',
      params: {
        company: company,
      },
    });
  };

  const restaurantProductDetail = (company, productId) => {
    return navigation.navigate('Restaurant', {
      screen: 'RestaurantProductDetails',
      params: {
        idProduct: productId,
        company: company,
        cartItem: null,
      },
    });
  };

  const renderItem = useCallback(
    ({item}) => {
      return (
        <ContainerRender onPress={() => bannerClick(item)}>
          <FastImage
            source={{
              uri: item?.product?.images[0],
              priority: FastImage.priority.high,
            }}
            style={styles.productBanner}
            resizeMode={FastImage.resizeMode.stretch}
          />
          <ContentTextView>
            <Text style={styles.txtProductName} numberOfLines={2}>
              {item?.product?.name}
            </Text>
            <Text style={styles.txtInfo} numberOfLines={1}>
              De
              <Text style={styles.txtPrice}>
                {' '}
                {formatMoney(item?.product?.price, configurations?.coin)}{' '}
              </Text>
            </Text>
            <Text style={styles.txtInfo} numberOfLines={1}>
              Por
              <Text style={styles.txtPricePromotion}>
                {' '}
                {formatMoney(
                  item?.product?.pricePromotion,
                  configurations?.coin,
                )}{' '}
              </Text>
            </Text>
          </ContentTextView>
          <CompanyImageView>
            <FastImage
              source={{
                uri: item?.company?.images[0],
                priority: FastImage.priority.medium,
              }}
              style={styles.companyImage}
              resizeMode={FastImage.resizeMode.stretch}
            />
          </CompanyImageView>
        </ContainerRender>
      );
    },
    [bannerClick],
  );

  return (
    <>
      {listBanner && listBanner.length > 0 ? (
        <Container>
          <Text style={styles.title}>Promoções do dia</Text>
          <ListBanner
            data={listBanner}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item._id}
            renderItem={renderItem}
          />
        </Container>
      ) : null}
    </>
  );
};

export default Banner;
