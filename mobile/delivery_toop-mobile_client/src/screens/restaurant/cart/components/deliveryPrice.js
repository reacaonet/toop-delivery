import React from 'react';
import {Text, ActivityIndicator, View} from 'react-native';
import {useSelector} from 'react-redux';
import {formatMoney} from '../../../../utils/index';
import {StyleSheet} from 'react-native';
import {Colors, Typography} from '../../../../styles';

export default function DeliveryPrice(deliveryFee, total = 0, delivery = {}) {
  const {configurations = null} = useSelector(state => state);

  if (deliveryFee === undefined || deliveryFee === null) {
    return null;
  }

  let retorno = 'Grátis';
  let subsidized = false; // bonificacao do frete

  if (deliveryFee > 0) {
    retorno = `${formatMoney(deliveryFee, configurations?.coin)}`;

    // frete gratis
    if (delivery?.shippingInfo?.freeShipping) {
      if (
        delivery?.shippingInfo?.freeShippingAbove === null ||
        delivery?.shippingInfo?.freeShippingAbove === 0
      ) {
        subsidized = true;
      } else if (total > delivery?.shippingInfo?.freeShippingAbove) {
        subsidized = true;
      }
    }
  }

  return (
    <>
      <View style={styles.listSub}>
        <Text style={styles.subTitle}>Taxa de Entrega</Text>
        {deliveryFee >= 0 ? (
          <Text
            style={[
              subsidized
                ? styles.subPriceFreeAll
                : deliveryFee > 0
                ? styles.subPrice
                : styles.subPriceFree,
            ]}>
            {retorno} (+)
          </Text>
        ) : (
          <ActivityIndicator
            color={Colors.PRIMARY}
            size="small"
            style={{width: 15, height: 15}}
          />
        )}
      </View>
      {subsidized ? (
        <View style={styles.listSub}>
          <Text style={styles.subTitleBonus}>Bônus de Entrega</Text>
          <Text style={styles.subPriceFree}>{retorno} (-)</Text>
        </View>
      ) : null}
    </>
  );
}

export const styles = StyleSheet.create({
  listSub: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  subTitle: {
    flex: 2,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    color: Colors.GREY,
  },
  subTitleBonus: {
    flex: 2,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    color: Colors.SUCCESS,
  },
  subPriceFreeAll: {
    flex: 1,
    textAlign: 'right',
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    textDecorationLine: 'line-through',
  },
  subPrice: {
    flex: 1,
    textAlign: 'right',
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
  },
  subPriceFree: {
    flex: 1,
    textAlign: 'right',
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    color: Colors.SUCCESS,
  },
});
