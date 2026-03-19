/* eslint-disable prettier/prettier */
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import { useSelector } from 'react-redux';

import styles from './styles';

// import { Container } from './styles';
import { formatMoney } from '../../../../../utils';

interface Props {
  historic?: any;
}

const History: React.FC<Props> = ({ historic }) => {
  const navigation = useNavigation<any>();

  const {
    configurations = null,
  }: any = useSelector((state: any) => state);

  return (
    <View>
      {historic && historic?.list && Array.isArray(historic?.list) && historic?.list.length > 0
        ? historic?.list.map((item: any) => {
          return (
            <View style={styles.containerTwo} key={item._id}>
              <View style={styles.text}>
                <Text style={styles.km}>{moment(item.createdAt).utc(true).format('DD/MM HH:mm')}</Text>
                <Text style={styles.km}>
                  {item?.payment?.driverTotal
                    ? formatMoney(item?.payment?.driverTotal || 0, configurations?.coin)
                    : formatMoney(item?.price || 0, configurations?.coin)
                  }
                </Text>
              </View>
              {/* <View style={styles.text}>
                <Text style={styles.subTitle}>Nº 1242</Text>
              </View> */}

              <View style={styles.street}>
                <View style={styles.line}>
                  <View style={styles.triangulo} />
                  <View style={styles.route} />
                  <View style={styles.ball} />
                </View>

                <View style={styles.box}>
                  <Text style={styles.titleStreet}>
                    {item?.origin?.address}
                  </Text>

                  {item?.destiny &&
                    Array.isArray(item?.destiny) &&
                    item?.destiny.length > 0 ? (
                    <Text style={styles.titleStreet}>
                      {item?.destiny[item?.destiny.length - 1]?.address || ''}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.borderLine} />
              <TouchableOpacity style={styles.button} onPress={() => {
                navigation.navigate('DetailGain', {
                  booking: item?._id,
                });
              }}>
                <View style={{ alignSelf: 'center', width: '100%' }}>
                  <Text style={{ textAlign: 'center', marginTop: 10 }}>
                    VER MAIS
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })
        : null}
    </View>
  );
};

export default History;
