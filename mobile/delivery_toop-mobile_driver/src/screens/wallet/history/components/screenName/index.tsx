import React, { useState, useCallback } from 'react';

import {
  Text,
  View,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

import { Colors } from '../../../../../styles';
import styles from './styles';
import History from './history';

/** Service */
import { bookingDriverHistoric } from '../../../../../services/provider/booking/bookingDriverHistoric';

import { formatMoney } from '../../../../../utils';

interface Props {
  goBack: any;
  go: any;
}

const HistoryRun: React.FC<Props> = ({ goBack, go }) => {
  const {
    authUser: { user = null },
    configurations = null,
  }: any = useSelector((state: any) => state);

  const [text, setText] = useState('');
  const [historic, setHistoric] = useState<any>([]);

  useFocusEffect(
    useCallback(() => {
      if (user?._id) {
        bookingDriverHistoric(user?._id, {}).then((result: any) => {
          if (result) {
            setHistoric(result);
          } else {
            setHistoric([]);
          }
        });
      }
    }, [user]),
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      {/*  Header */}
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity onPress={goBack}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
        <Text style={styles.title}>GANHOS</Text>
      </SafeAreaView>

      {/* BODY */}

      {/* CONTAINER 1 */}
      <View style={styles.container}>
        <View style={styles.text}>
          <Text style={styles.title2}>Corridas</Text>
          <Text style={styles.title2}>Ganhos</Text>
        </View>
        <View style={styles.text}>
          <Text style={styles.subTitle}>{historic?.totalRuns || 0}</Text>
          <Text style={styles.subTitle}>
            {formatMoney(historic?.total || 0, configurations?.coin)}
          </Text>
        </View>

        {/* <View style={styles.borderLine} /> */}

        {/* <TouchableOpacity style={styles.button}>
          <View style={{ marginTop: 10, flexDirection: 'row' }}>
            <Icon name="navigate-before" size={24} style={styles.icon} />
            <View style={styles.day}>
              <Text>Hoje</Text>
            </View>
          </View>
        </TouchableOpacity> */}
      </View>

      <FlatList
        data={[{ title: 'Title Text', key: 'item1' }]}
        style={{ marginBottom: 10 }}
        renderItem={() => <History historic={historic} />}
      />
    </View>
  );
};

export default HistoryRun;
