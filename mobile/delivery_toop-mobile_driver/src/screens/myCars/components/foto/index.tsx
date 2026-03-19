import React, { useEffect, useState } from 'react';

import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Typography, Colors } from '../../../../styles';
import SendCr from './sendCr';

interface Props {
  navigation: any;
}

const Cars: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<any>();
  const [text, setText] = React.useState('');

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <SendCr
        submit={() => navigation.navigate('CamCr', route.params)}
        goBack={() => navigation.navigate('Cars')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  iconGoBack: {
    color: Colors.BLACK,
    marginLeft: 5,
  },

  safeAreaView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  container: {
    width: '90%',
    height: 120,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },

  containerTwo: {
    width: '90%',
    height: 80,
    flexDirection: 'row',
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },
  containerThree: {
    width: '90%',
    height: 50,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },

  containCar: {
    flexDirection: 'column',
    marginTop: 12,
  },

  title: {
    marginTop: 10,
    marginRight: 20,
    fontWeight: 'bold',
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  carName: {
    marginTop: 10,
    marginLeft: 10,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  placa: {
    marginBottom: 20,
    marginRight: 20,
    marginLeft: 10,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  value: {
    bottom: 10,
    paddingRight: 20,
    position: 'absolute',
    width: '100%',
    textAlign: 'right',
    fontSize: Typography.FONT_SIZE_30,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  subTitle: {
    marginTop: 20,
    marginBottom: 20,
    marginRight: 10,
    marginLeft: 60,
    width: '100%',
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  sub: {
    marginTop: 20,
    marginBottom: 20,
    marginRight: 10,
    marginLeft: 25,
    width: '100%',
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  titleStreet: {
    marginTop: 20,
    marginRight: 10,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },
  line: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 10,
  },

  box: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 10,
  },

  containButton: {
    marginTop: 15,
    height: '100%',
  },

  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  button2: {
    flexDirection: 'row',
  },

  history: {
    marginBottom: 20,
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  iconNext: {
    color: Colors.BLACK,
    marginRight: 5,
  },

  iconCar: {
    color: Colors.BLACK,
    marginTop: 20,
    marginLeft: 20,
  },
  iconInd: {
    color: Colors.BLACK,
    textAlign: 'right',
    marginLeft: 130,
    marginTop: 25,
  },

  hands: {
    color: Colors.BLACK,
    marginLeft: 20,
  },
  balance: {
    color: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_20,
    marginRight: 50,
    marginLeft: 50,
  },

  containGain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default Cars;
