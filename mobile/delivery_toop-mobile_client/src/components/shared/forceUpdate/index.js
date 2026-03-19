import React from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  Platform,
  Dimensions,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from 'react-native';

import {Typography, Colors} from './../../../styles';
import packageJson from '../../../../package.json';

const forceUpdate = ({}) => {
  const widthScreen = Dimensions.get('screen').width;
  const title = 'Atualização necessária';

  const text = `Existe uma nova versão do aplicativo na ${
    Platform.OS === 'ios' ? 'Apple Store' : 'Google Play Store'
  }. Realize a atualização e aproveite os novos recursos :)`;

  const link =
    Platform.OS === 'ios'
      ? `https://apps.apple.com/br/app/${packageJson.appleId}`
      : `market://details?id=${packageJson.androidPackage}`;

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{flex: 1, alignContent: 'center', justifyContent: 'center'}}>
        <View
          style={{
            justifyContent: 'center',
            flexDirection: 'column',
          }}>
          <View style={styles.center}>
            <Image
              style={styles.ToopDeliveryand}
              source={require('../../../assets/images/login/logo_ecbr.png')}
              resizeMode="contain"
            />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{text}</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(link)}
              style={styles.loginPhone}>
              <Text style={styles.loginPhoneText}>Atualizar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default forceUpdate;

const styles = StyleSheet.create({
  economizeHeader: {
    width: '40%',
    height: '40%',
    marginLeft: '5%',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  ToopDeliveryand: {
    marginTop: 10,
    width: '90%',
    height: '30%',
  },
  title: {
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    color: Colors.BLACK,
    marginTop: 40,
  },
  subtitle: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
    marginTop: 30,
    textAlign: 'center',
  },
  loginPhone: {
    width: '100%',
    height: 42,
    backgroundColor: Colors.WHITE,
    borderRadius: 7,
    borderWidth: 0.3,
    borderColor: Colors.GREY_LIGHT,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginTop: 30,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginPhoneText: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_15,
    color: Colors.BLACK,
  },
  boxOptionsLogin: {
    flexShrink: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  otherLogin: {
    alignSelf: 'center',
  },
  otherLoginText: {
    color: Colors.PRIMARY,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_15,
  },
  viewVersion: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    marginTop: 15,
  },
  txtVersion: {
    fontSize: Typography.FONT_SIZE_10,
  },
});
