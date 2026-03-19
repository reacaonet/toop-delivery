/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity} from 'react-native';
import Swiper from 'react-native-swiper';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';

import {StorageGet} from '../../../../services/deviceStorage';
import {listSlider} from '../../../../services/service/slider';

import styles from './styles';

import LootieView from 'lottie-react-native';
import loaderLootie from '../../../../assets/animations/loader.json';

const Slide = ({segment}) => {
  const navigation = useNavigation();

  const [login, setLogin] = useState(true);
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    getSlidesAndShow();
  }, []);

  const getSlidesAndShow = async () => {
    let respAddress = await StorageGet('@addressUser');
    let params = {};

    if (
      respAddress &&
      respAddress.location &&
      respAddress.location.coordinates
    ) {
      params.latitude = respAddress.location.coordinates[1];
      params.longitude = respAddress.location.coordinates[0];
    }

    params.segment = segment?._id;

    const result = await listSlider(params);

    setLogin(false);

    if (!result) {
      setSlides([]);
    }

    setSlides(result);
  };

  const sliderClick = async slide => {
    let companyType = slide?.company?.shoppingFlow || null;
    let companyId = slide?.company?._id || null;
    let companyClick = slide?.companyClick || null;
    let productId = slide?.productId || null;

    if (productId && companyType) {
      if (companyType === 'PRODUCT') {
        return supermarketProductDetail(slide.company, productId);
      } else if (companyType === 'MENU') {
        return restaurantProductDetail(slide.company, productId);
      }
    }

    if (companyClick === true && companyId && companyType === 'PRODUCT') {
      return supermarketProduct(slide.company);
    } else if (companyClick === true && companyId && companyType === 'MENU') {
      return restaurantProduct(slide.company);
    }
  };

  const supermarketProduct = company => {
    return navigation.navigate('Supermarket', {
      screen: 'Product',
      params: {
        company: company,
      },
    });
  };

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

  return (
    <View style={styles.boxSlide}>
      {login ? (
        <View style={styles.BoxLoader}>
          <LootieView
            source={loaderLootie}
            style={{height: 60}}
            resizeMode="contain"
            loop
            autoPlay
          />
        </View>
      ) : slides && slides.length > 0 ? (
        <Swiper
          showsButtons={false}
          showsPagination={false}
          autoplay={true}
          autoplayTimeout={4}
          horizontal={true}
          loadMinimal={true}
          loadMinimalSize={1}
          automaticallyAdjustContentInsets={true}
          containerStyle={styles.swiperContainer}>
          {slides.map(slide => {
            return (
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.slide}
                onPress={() => sliderClick(slide)}>
                <FastImage
                  key={slide._id}
                  source={{
                    uri: slide.images[0],
                    priority: FastImage.priority.high,
                  }}
                  style={styles.slide}
                  resizeMode={FastImage.resizeMode.stretch}
                />
              </TouchableOpacity>
            );
          })}
        </Swiper>
      ) : null}
    </View>
  );
};

export default Slide;
