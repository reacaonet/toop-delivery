/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/core';

import Permission from '../../../services/permissions/permissions';

import styles from './styles';

const LocationPermission = ({ navigation }: any) => {
  const map = require('./images/Map.png');
  const [load, setLoad] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!load) {
        setLoad(true);
      }

      const verifyPermissions = async () => {
        const isPermission = await Permission().isPermission();
        if (isPermission) {
          Platform.OS === 'android'
            ? navigation.navigate('AlertWindow')
            : navigation.navigate('Splash');
        } else {
          setLoad(false);
        }
      };

      verifyPermissions();
    }, []),
  );

  const notAllow = useCallback(() => {
    Alert.alert(
      'Permissão',
      'Infelizmente não poderemos prosseguir o uso da localização e essencial para o funcionamento do aplicativo',
    );
  }, []);

  const acceptPermission = async () => {
    const isPermission = await Permission().setPermission();

    if (!isPermission) {
      return Linking.openSettings();
    }

    Platform.OS === 'android'
      ? navigation.navigate('AlertWindow')
      : navigation.navigate('Splash');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar barStyle={'dark-content'} /> */}
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
                  Este aplicativo coleta dados de localização para receber
                  corridas de clientes mais próximos, mesmo quando o aplicativo
                  está fechado.
                </Text>
                <Text style={styles.SubTitleLocation}>
                  Dessa forma, te enviaremos as solicitações de corridas mais
                  próximas da sua localização. Durante a corrida, por questões
                  de segurança, monitoramos o trajeto da corrida.
                </Text>
                <Text style={styles.SubTitleLocation}>
                  Você pode alterar essa opção posteriormente nas configurações
                  do app.
                </Text>
              </View>
            </View>
          </ScrollView>
          <View style={styles.BoxFooter}>
            {/* <TouchableOpacity style={styles.btn} onPress={() => notAllow()}>
              <Text style={styles.btnText}>Não Permitir</Text>
            </TouchableOpacity> */}
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
