/* eslint-disable prettier/prettier */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import styles from './styles';

export const MapHeader = ({ navigation, activeBooking }: any) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => navigation.openDrawer()}>
        <MaterialCommunityIcons name="menu" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.headerTextContainer}>
        {activeBooking?.status === 'accepted' &&
          activeBooking?.arrivedLocal !== true ? (
          <Text style={styles.headerText}>Aguarde no local do embarque</Text>
        ) : null}

        {activeBooking?.status === 'accepted' &&
          activeBooking?.arrivedLocal === true ? (
          <Text style={styles.headerText}>O motorista chegou!</Text>
        ) : null}

        {activeBooking?.status === 'in_progress' ? (
          <Text style={styles.headerText}>{t('raceStart')}</Text>
        ) : null}
      </View>
    </View>
  );
};
