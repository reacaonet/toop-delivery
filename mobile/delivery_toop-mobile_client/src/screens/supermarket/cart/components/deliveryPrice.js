import React, {useEffect, useState} from 'react';
import {Text, View, ActivityIndicator, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';

import {formatMoney} from '../../../../utils/index';
import {Colors, Typography} from '../../../../styles';

const DeliveryPrice = ({deliveryFee}) => {
  const {configurations = null} = useSelector(state => state);
  const [retorno, setRetorno] = useState('');

  useEffect(() => {
    if (deliveryFee > 0) {
      setRetorno(`${formatMoney(deliveryFee, configurations?.coin)}`);
    } else if (deliveryFee === 0) {
      setRetorno('Grátis');
    } else {
      setRetorno('');
    }
  }, [deliveryFee, configurations?.coin]);

  return (
    <View style={styles.listSub}>
      <Text style={styles.subTitle}>Taxa de Entrega</Text>
      {deliveryFee >= 0 ? (
        <Text style={deliveryFee > 0 ? styles.subPrice : styles.subPriceFree}>
          {retorno}
        </Text>
      ) : (
        <ActivityIndicator
          color={Colors.PRIMARY}
          size="small"
          style={{width: 15, height: 15}}
        />
      )}
    </View>
  );
};

export default React.memo(DeliveryPrice);

export const styles = StyleSheet.create({
  listSub: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  subTitle: {
    color: '#b6b6b6',
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
  subPrice: {
    color: '#b6b6b6',
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
  subPriceFree: {
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    color: Colors.SUCCESS,
  },
});
