/* eslint-disable prettier/prettier */
import React, { useState, useCallback } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
// import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './styles';
import { formatMoney } from '../../../../utils';

/** Service */
import { bookingDriverHistoric } from '../../../../services/provider/booking/bookingDriverHistoric';

interface Props {
  plus: any;
}

const History: React.FC<Props> = ({ plus }) => {
  const {
    authUser: { user = null },
    configurations = null,
  }: any = useSelector((state: any) => state);

  const [historic, setHistoric] = useState([]);

  useFocusEffect(
    useCallback(() => {
      if (user?._id) {
        bookingDriverHistoric(user?._id, {
          onlyHistoric: true,
        }).then(result => {
          if (result && result.list) {
            setHistoric(result.list);
          } else {
            setHistoric([]);
          }
        });
      }
    }, [user]),
  );

  return (
    <View>
      {historic.map((item: any) => {
        return (
          <View style={styles.containerTwo} key={item?._id}>
            <View style={styles.text}>
              <Text style={styles.km}>-</Text>
              <Text style={styles.km}>{formatMoney(item?.price, configurations?.coin)}</Text>
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
                <Text style={styles.titleStreet}>{item?.origin?.address}</Text>

                {item?.destiny &&
                  Array.isArray(item?.destiny) &&
                  item?.destiny.length > 0 ? (
                  <Text style={styles.titleStreet}>
                    {item?.destiny[item?.destiny.length - 1]?.address || ''}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* <View style={styles.borderLine} />

        <TouchableOpacity style={styles.button} onPress={plus}>
          <View style={{ alignSelf: 'center', width: '100%' }}>
            <Text style={{ textAlign: 'center', marginTop: 10 }}>VER MAIS</Text>
          </View>
        </TouchableOpacity> */}
          </View>
        );
      })}
    </View>
  );
};

export default History;
