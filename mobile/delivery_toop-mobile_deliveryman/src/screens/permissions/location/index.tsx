import React, {useEffect, useCallback, useState} from 'react';
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
} from 'react-native';

import Permission from '../../../services/permissions/permissions';

import styles from './styles';

const LocationPermission = ({navigation}: any) => {
  const map = require('./images/Map.png');
  const [load, setLoad] = useState(true);

  useEffect(() => {
    if (!load) {
      setLoad(true);
    }

    const verifyPermissions = async () => {
      const isPermission = await Permission().isPermission();
      if (isPermission) {
        navigation.navigate('AlertWindow');
      } else {
        setLoad(false);
      }
    };

    verifyPermissions();
  }, []);

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

    navigation.navigate('AlertWindow');
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
              Receba Entregas, Ativando a Localização
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
                  Este aplicativo coleta dados de localização para habilitar a
                  busca pelos entregadores mais próximos, mesmo quando o
                  aplicativo está fechado ou não em uso.
                </Text>

                <Text style={styles.SubTitleLocation}>
                  Dessa forma, te enviaremos as entregas mais próximos da sua
                  localização. E durante a corrida, por questões de segurança,
                  monitoramos o trajeto da corrida.
                </Text>
              </View>
            </View>
          </ScrollView>
          <View style={styles.BoxFooter}>
            <TouchableOpacity style={styles.btn} onPress={() => notAllow()}>
              <Text style={styles.btnText}>Não Permitir</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => acceptPermission()}>
              <Text style={[styles.btnText, styles.btnTextPrimary]}>
                Permitir
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default LocationPermission;
