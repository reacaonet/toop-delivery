import React from 'react';
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Typography, Colors} from '../../styles';

import Rota from './components/rota';

const Msg = ({navigation}) => {
  return (
    <View style={{flex: 1, marginTop: 10}}>
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
        <Text style={styles.title}>MENSAGENS</Text>
      </SafeAreaView>
      <Rota />
    </View>
  );
};

export default Msg;

const styles = StyleSheet.create({
  iconGoBack: {
    color: '#992326',
    marginLeft: 5,
  },

  safeAreaView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  title: {
    marginTop: 10,
    marginRight: 20,
    fontWeight: 'bold',
    fontSize: 18,
    color: '#992326',
  },
});
