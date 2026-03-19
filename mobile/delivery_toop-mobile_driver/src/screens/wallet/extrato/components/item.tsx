import React from 'react';
import { Typography, Colors } from '../../../../styles';
import { View, Text, StyleSheet } from 'react-native';

interface Item {
  name: string;
  value: string;
}

interface ItemsProps {
  Items: Item[];
}

const Items = [
  {
    name: 'Ganho pedido nº 1234',
    value: '+ 1,50',
  },
];

function Item(): JSX.Element {
  return (
    <>
      {Items &&
        Items.length > 0 &&
        Items.map(element => (
          <View style={styles.containExtrato}>
            <Text style={styles.extrato}>{element.name}</Text>
            <Text style={styles.extrato}>{element.value}</Text>
          </View>
        ))}
    </>
  );
}

export default Item;

const styles = StyleSheet.create({
  container: {
    width: '90%',
    height: 60,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },

  text: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  contain: {
    marginTop: 15,

    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  containExtrato: {
    marginTop: 15,
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: Colors.GRAY_LIGHT,
    borderBottomWidth: 1,
  },

  total: {
    marginTop: 15,
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  value: {
    marginBottom: 20,
    marginRight: 20,
    marginLeft: 20,
    marginTop: 5,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  extrato: {
    marginBottom: 20,
    marginRight: 20,
    marginLeft: 20,
    marginTop: 5,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.ARROW,
  },

  totalpag: {
    marginBottom: 20,
    marginRight: 20,
    marginLeft: 20,
    marginTop: 5,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },
});
