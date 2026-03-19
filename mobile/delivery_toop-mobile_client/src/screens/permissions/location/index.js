import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';

import {useFocusEffect} from '@react-navigation/core';

import Permission from '../../../services/permissions/locationPermission';

import styles from './styles';

const LocationPermission = ({navigation}) => {
  const map = require('./images/map.png');

  const [load, setLoad] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!load) {
        setLoad(true);
      }

      const verifyPermissions = async () => {
        const isPermission = await Permission().isPermission();
        if (isPermission) {
          navigation.navigate('Splash');
        } else {
          setLoad(false);
        }
      };

      verifyPermissions();
    }, []),
  );

  const acceptPermission = async () => {
    const isPermission = await Permission().setPermission();

    if (!isPermission) {
      return Linking.openSettings();
    }

    navigation.navigate('Splash');
  };

  return (
    <SafeAreaView style={styles.container}>
      {load ? (
        <View style={styles.containerLoad}>
          <ActivityIndicator size="large" color={'blue'} />
        </View>
      ) : (
        <View style={styles.container}>
          <ScrollView style={styles.BoxInfo}>
            <Text style={styles.title}>
              Receba corridas ativando a Localização
            </Text>

            <View style={styles.viewMap}>
              <Image source={map} style={styles.map} resizeMode="contain" />
            </View>

            <View
              style={{
                flexGrow: 1,
              }}>
              <Text style={styles.titleLocation}>Permita localização</Text>
              <View style={styles.BoxSubTitleLocation}>
                <Text style={styles.SubTitleLocation}>
                  Este aplicativo coleta dados de localização para indicar
                  promoções e restaurantes que entregam na sua região.
                </Text>
                <Text style={styles.SubTitleLocation}>
                  Dessa forma, te enviaremos as melhores promoções e a lista de
                  restaurantes mais próximos da sua localização.
                </Text>
                <Text style={styles.SubTitleLocation}>
                  Você pode alterar essa opção posteriormente nas configurações
                  do app.
                </Text>
              </View>
            </View>
          </ScrollView>
          <View style={styles.BoxFooter}>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => acceptPermission()}>
              <Text style={[styles.btnText, styles.btnTextPrimary]}>
                Continuar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default LocationPermission;
