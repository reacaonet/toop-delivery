/* eslint-disable react-hooks/exhaustive-deps */
import React, {useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  Keyboard,
} from 'react-native';
import styles from './styles';
import Card from '../Card';
import LootieView from 'lottie-react-native';
import loaderLootie from '../../../../assets/animations/loader.json';
import NotResults from '../NotResults';

const ListResults = ({
  restaurants,
  address,
  updateCompayType,
  init,
  load,
  notResults,
}) => {
  /* Animated */
  const widthScreen = Dimensions.get('screen').width;
  const widthAnimated = useRef(new Animated.Value(widthScreen - 50)).current;

  /* Cycle */

  useEffect(() => {
    // settingAnimated(0);
    if (load === false) {
      settingAnimated();
    }
  }, [load, restaurants]);

  const settingAnimated = useCallback(toValue => {
    Keyboard.dismiss();

    Animated.parallel([
      Animated.timing(widthAnimated, {
        toValue: widthScreen,
        useNativeDriver: false,
        duration: 0,
      }),
      Animated.timing(widthAnimated, {
        toValue: 0,
        useNativeDriver: false,
        duration: 400,
      }),
    ]).start();
  }, []);

  const searchCompany = async typeValue => {
    if (typeValue === 'restaurant') {
      updateCompayType('restaurant');
      return;
    }

    if (typeValue === 'supermarket') {
      updateCompayType('supermarket');
      return;
    }
  };

  const getLoad = () => {
    return (
      <View style={styles.loaderContainer}>
        <LootieView
          source={loaderLootie}
          style={{height: 100}}
          resizeMode="cover"
          loop
          autoPlay
        />
      </View>
    );
  };

  return (
    <>
      {init === false ? (
        <View style={styles.container}>
          {load ? getLoad() : null}
          {notResults === true ? <NotResults /> : null}
          {load === false &&
          notResults !== true &&
          restaurants &&
          restaurants.length > 0 ? (
            <Animated.View
              style={[styles.containerResult, {left: widthAnimated}]}>
              <FlatList
                initialScrollIndex={0}
                scrollEnabled={true}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatStyle}
                data={restaurants}
                keyExtractor={item => `${item._id}`}
                renderItem={item => <Card item={item} address={address} />}
              />
            </Animated.View>
          ) : null}
        </View>
      ) : null}
    </>
  );
};

export default ListResults;
