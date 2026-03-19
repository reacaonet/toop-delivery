/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState} from 'react';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors} from '../../../../styles';

import {FlatList} from 'react-native';

import {Container} from './styles';

import Component from './component';

const Store = ({navigation}: any) => {
  return (
    <Container>
      <Component
        onPress={() => navigation.navigate('Department')}
        add={() => navigation.navigate('NewProduct')}
        products={() => navigation.navigate('Products')}
        deletePost={() => navigation.navigate('Home')}
      />
    </Container>
  );
};

export default Store;
