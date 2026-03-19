/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import { useTranslation } from 'react-i18next';

import styles from './styles';
import { Colors } from '../../../styles';

import { StorageGet, StorageSet } from '../../../services/deviceStorage';

/** Service */
import drawOverlays from '../../../services/permissions/drawOverlays';

const AlertWindow = ({ navigation }: any) => {
  const [load, setLoad] = useState(true);
  const map = require('./images/icon_app.png');
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      // android.settings.action.MANAGE_OVERLAY_PERMISSION
      const init = async () => {
        if (load !== true) {
          setLoad(true);
        }

        const value = await StorageGet('@drawOverlays');
        if (value === 'true' || value === 'false') {
          return navigation.navigate('Splash');
        }

        const isPermission = await drawOverlays().isPermission();
        if (!isPermission) {
          setLoad(false);
          return;
        }

        await StorageSet('@drawOverlays', 'true');
        navigation.navigate('Splash');
      };

      init();
    }, []),
  );

  const toAllow = async () => {
    try {
      const isPermission = await drawOverlays().isPermission();
      if (!isPermission) {
        return drawOverlays().sendSettings();
      }

      navigation.navigate('Splash');
    } catch (err) {
      console.log('fail toAllow', err);
    }
  };

  const notAllow = async () => {
    try {
      await StorageSet('@drawOverlays', 'false');
      navigation.navigate('Splash');
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
              {t('permissions.alertWindow.title')}
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
                  {t('permissions.alertWindow.subTitle')}
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
