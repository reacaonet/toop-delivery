/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {Colors, Typography} from '../../../styles';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CartItemComplement = ({
  add,
  remove,
  qtd,
  id,
  disposed,
  complement_id,
  complement_amountMax,
}) => {
  return (
    <SafeAreaView>
      {disposed ? (
        <View style={styles.checkout}>
          <View style={styles.containerQtd}>
            <TouchableOpacity
              style={styles.btQtd}
              onPress={() => {
                if (qtd === 0) {
                  return;
                }
                remove(id, qtd - 1, complement_id, complement_amountMax);
              }}>
              <Icon name="remove" style={styles.btQtdIcon} />
            </TouchableOpacity>
            <Text style={styles.txtQtd}>{qtd}</Text>
            <TouchableOpacity
              style={styles.btQtd}
              onPress={() =>
                add(id, qtd + 1, complement_id, complement_amountMax)
              }>
              <Icon name="add" style={styles.btQtdIcon} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default React.memo(CartItemComplement);

const styles = StyleSheet.create({
  checkout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 150,
    paddingHorizontal: '3%',
    marginBottom: 5,
  },
  checkoutText: {
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
  btnCheckoutTouch: {
    flex: 1,
    borderRadius: 5,
    alignContent: 'center',
    flexDirection: 'row',
  },
  btnCheckout: {
    flex: 1,
    borderRadius: 5,
    alignItems: 'center',
    flexDirection: 'row',
    // borderTopRightRadius: 10,
    // paddingHorizontal: 40,
    // paddingVertical: 15,
  },
  txtCheckout: {
    flex: 1,
    textAlignVertical: 'center',
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.WHITE,
    marginLeft: 15,
    justifyContent: 'center',
  },
  containerQtd: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 5,
    padding: 7,
    paddingVertical: 10,
    borderColor: Colors.GRAY_MEDIUM,
    backgroundColor: Colors.WHITE,
  },
  containerQtdAdd: {
    flex: 2,
    alignItems: 'center',
    marginLeft: 8,
  },
  txtQtd: {
    color: Colors.PRIMARY,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: Typography.FONT_SIZE_16,
    paddingHorizontal: 10,
  },
  txtBtn: {
    flex: 1,
    textAlign: 'right',
    marginRight: 10,
    color: Colors.WHITE,
    textAlignVertical: 'center',
    fontFamily: Typography.FONT_FAMILY_MEDIUM,
    fontSize: Typography.FONT_SIZE_16,
  },
  btQtd: {
    //
  },
  btQtdIcon: {
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    fontSize: 22,
    color: Colors.PRIMARY,
  },
});
