import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import styles from './styles';
import { Colors } from '../../../styles';
import AsyncStorage from '@react-native-community/async-storage';

/** Service */
import drawOverlays from '../../../services/permissions/drawOverlays';

const AlertWindow = ({ navigation }: any) => {
  const [load, setLoad] = useState(true);
  const map = require('./images/icon_app.png');

  useEffect(() => {
    // android.settings.action.MANAGE_OVERLAY_PERMISSION
    const init = async () => {
      if (load !== true) {
        setLoad(true);
      }

      // await AsyncStorage.removeItem('@drawOverlays')

      const value = await AsyncStorage.getItem('@drawOverlays');
      if (value === 'true' || value === 'false') {
        return navigation.navigate('Login');
      }

      const isPermission = await drawOverlays().isPermission();
      if (!isPermission) {
        setLoad(false);
        return;
      }

      await AsyncStorage.setItem('@drawOverlays', 'true');
      navigation.navigate('Login');
    };

    init();
    return () => { };
  }, []);

  const toAllow = async () => {
    try {
      const isPermission = await drawOverlays().isPermission();
      if (!isPermission) {
        return drawOverlays().sendSettings();
      }

      navigation.navigate('Login');
    } catch (err) {
      console.log('fail toAllow', err);
    }
  };

  const notAllow = async () => {
    try {
      await AsyncStorage.setItem('@drawOverlays', 'false');
      navigation.navigate('Login');
    } catch (err) {
      console.log('fail notAllow', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar barStyle={'dark-content'} /> */}
      {load ? (
        <View style={styles.containerLoad}>
          <ActivityIndicator size={'large'} color={Colors.PRIMARY} />
        </View>
      ) : (
        <View style={styles.container}>
          <ScrollView style={styles.BoxInfo}>
            <Text style={styles.title}>
              Veja as Entregas recebidas mais facilmente
            </Text>

            <View style={styles.viewMap}>
              <Image source={map} style={styles.map} resizeMode="contain" />
            </View>

            <View style={styles.viewContent}>
              <Text style={styles.titleLocation}>
                Permita aparecer sobre outros aplicativos
              </Text>
              <View style={styles.BoxSubTitleLocation}>
                <Text style={styles.SubTitleLocation}>
                  Esta permissão é utilizada para que possamos direcionar uma
                  entrega e abrir o aplicativo para você. Facilitando para que
                  você possa aceitar uma entrega mais facilmente
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
              onPress={() => toAllow()}>
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

export default AlertWindow;
