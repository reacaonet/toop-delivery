/* eslint-disable react-hooks/exhaustive-deps */
import React, {FunctionComponent, useState, useEffect} from 'react';
import {View, TextInput, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors, Typography} from '../../../styles';

type cartAddtProps = {
  item: any;
};

const CartAdd: FunctionComponent<cartAddtProps> = ({item}: cartAddtProps) => {
  const [qtd, setQtd] = useState(item.amount);

  useEffect(() => {
    //console.log('Item', item);
  }, []);

  const incrementItem = () => {
    let itemQtd = qtd + 1;
    setQtd(itemQtd);
  };
  const decrementItem = () => {
    let itemQtd = qtd - 1;
    itemQtd = itemQtd < 0 ? 0 : itemQtd;
    setQtd(itemQtd);
  };

  const cardOne = () => {
    return (
      <TouchableOpacity style={styles.iconAdd} onPress={() => incrementItem()}>
        <Icon name="add-circle" size={35} color={Colors.PRIMARY} />
      </TouchableOpacity>
    );
  };

  const cardTwo = () => {
    return (
      <View style={styles.listQtd}>
        <TouchableOpacity onPress={() => decrementItem()}>
          <Icon name="remove-circle" size={28} color={Colors.PRIMARY} />
        </TouchableOpacity>
        <TextInput style={styles.inputCart} value={`${qtd}`} editable={false} />
        <TouchableOpacity onPress={() => incrementItem()}>
          <Icon name="add-circle" size={28} color={Colors.PRIMARY} />
        </TouchableOpacity>
      </View>
    );
  };

  const selectCart = () => {
    if (qtd > 0) {
      return cardTwo();
    }

    return cardOne();
  };

  return selectCart();
};

export default CartAdd;

const styles = StyleSheet.create({
  iconAdd: {
    marginTop: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listQtd: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  inputCart: {
    marginTop: 0,
    borderRadius: 7,
    borderColor: Colors.GREY,
    borderWidth: 1,
    marginHorizontal: 3,
    width: 25,
    height: 25,
    padding: 0,
    color: Colors.PRIMARY,
    fontSize: Typography.FONT_SIZE_14,
    textAlign: 'center',
  },
});
