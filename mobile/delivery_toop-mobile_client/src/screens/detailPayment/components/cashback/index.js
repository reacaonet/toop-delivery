import React, {useState} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';

/** Style */
import {Colors, Typography} from '../../../../styles';

/** Util */
import {formatMoney} from './../../../../utils/';

const CashBack = ({
  cashbackBalance,
  useCashbackBalance,
  setUseCashbackBalance,
}) => {
  const {configurations = null} = useSelector(state => state);

  return (
    <View style={styles.container}>
      <Text style={styles.textCash}>Usar CASHBACK disponível:</Text>
      <Text style={styles.textPrice}>
        {' '}
        {formatMoney(cashbackBalance, configurations?.coin)}
      </Text>
      <TouchableOpacity
        style={styles.containerCash}
        onPress={() =>
          setUseCashbackBalance(useCashbackBalance > 0 ? 0 : cashbackBalance)
        }>
        {useCashbackBalance > 0 ? (
          <View style={styles.cashSelected} />
        ) : (
          <View style={styles.cashDisabled} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CashBack;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 18,
    height: 70,
    flexDirection: 'row',
    paddingHorizontal: 20,
    backgroundColor: Colors.SECONDARY,
  },
  textCash: {
    color: Colors.WHITE,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
  },
  textPrice: {
    flex: 1,
    color: Colors.WHITE,
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
  containerCash: {
    width: 40,
    height: 20,
    borderRadius: 20,
    backgroundColor: Colors.BACKGROUND,
  },
  cashDisabled: {
    flex: 1,
    width: 20,
    margin: 1,
    borderRadius: 10,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: Colors.GREY_LIGHT,
  },
  cashSelected: {
    flex: 1,
    width: 20,
    margin: 1,
    marginLeft: 19,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
  },
});
