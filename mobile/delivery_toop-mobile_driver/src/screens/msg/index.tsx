import React from 'react';
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Typography, Colors } from '../../styles';
import App from './components/navigation';

interface Props {
  navigation: any;
}

const Msg = ({ navigation }: Props) => {
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity onPress={() => navigation.navigate('DriverMap')}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
        <Text style={styles.title}>MENSAGENS</Text>
      </SafeAreaView>
      <App nav={() => navigation.navigate('Conversation')} />
    </View>
  );
};

export default Msg;

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

  title: {
    marginTop: 10,
    marginRight: 20,
    fontWeight: 'bold',
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },
});
