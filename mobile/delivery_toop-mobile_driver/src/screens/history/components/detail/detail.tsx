/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback } from 'react';

import {
  Text,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import DetailGain from './component';
import { Colors } from '../../../../styles';
import styles from './styles';

/** Service */
import { listOneBooking } from '../../../../services/provider/booking/list';

interface Props {
  navigation: any;
}

const Detail: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<any>();
  const { t } = useTranslation();

  const [bookingId, setBookingId] = useState<string | null>(
    route.params?.bookingId || null,
  );

  const [booking, setBooking] = useState<any>({});

  useFocusEffect(
    useCallback(() => {
      if (route.params?.booking) {
        setBookingId(route.params?.booking);
      }
    }, [route.params?.booking]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!bookingId) {
        return;
      }

      listOneBooking(bookingId).then(result => {
        if (result && result._id) {
          setBooking(result);
        } else {
          setBooking({});
        }
      });
    }, [bookingId]),
  );

  function ir() {
    navigation.navigate('Conversation');
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity
          onPress={() => navigation.navigate('HistoryCar')}
          style={styles.touchBefore}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>

        <Text style={styles.title}>DETALHES DA {t('race')}</Text>
      </SafeAreaView>

      <FlatList
        data={[{ title: 'Title Text', key: 'item1' }]}
        style={{ marginTop: 10 }}
        renderItem={() => <DetailGain ir={ir} booking={booking} />}
      />
    </View>
  );
};

export default Detail;
