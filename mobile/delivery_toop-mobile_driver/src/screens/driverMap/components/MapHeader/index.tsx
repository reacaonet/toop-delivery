/* eslint-disable prettier/prettier */
import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';

import styles from './styles';
import { formatMoney } from '../../../../utils';

/** Service */
import { bookingDriverHistoric } from '../../../../services/provider/booking/bookingDriverHistoric';

export const MapHeader = ({
  navigation,
  booking,
  destiny,
  time,
}: any) => {
  const {
    authUser: { user = null },
    configurations,
  }: any = useSelector((state: any) => state);

  const [totalReceivable, setTotalReceivable] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (user?._id) {
        bookingDriverHistoric(user?._id, {
          onlyTotal: true,
          today: true,
        }).then(result => {
          if (result && result.total) {
            setTotalReceivable(result.total);
          } else {
            setTotalReceivable(0);
          }
        });
      }
    }, [user]),
  );

  return (
    <View style={styles.container}>
      {booking &&
        Array.isArray(booking) &&
        booking.length > 0 &&
        (booking[0].status === 'accepted' ||
          booking[0].status === 'in_progress') ? (
        <>
          {booking[0].status === 'in_progress' && booking[0].additionalStops &&
            Array.isArray(booking[0].additionalStops) &&
            booking[0].additionalStops.length > booking[0].arrivedStops ? (
            <View style={styles.addressDestination}>
              <Text style={styles.txtAddress}>
                {booking[0]?.additionalStops[0]?.address}
              </Text>
              <Text style={styles.txtTime}>{time}</Text>
            </View>
          ) : destiny && destiny?.address ? (
            <View style={styles.addressDestination}>
              <Text style={styles.txtAddress}>{destiny?.address}</Text>
              <Text style={styles.txtTime}>{time}</Text>
            </View>
          ) : null}
        </>
      ) : (
        <>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.openDrawer()}>
            <MaterialCommunityIcons name="menu" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.money}
            onPress={() => {
              // navigation.navigate('Gain')
              navigation.navigate('HistoryCar');
            }}>
            <Text style={styles.dayText}>{moment().format('DD/MM')}</Text>
            <Text style={styles.moneyText}>{formatMoney(totalReceivable, configurations?.coin)}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};
