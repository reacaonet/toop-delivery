/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
// import Item from './item';
import moment from 'moment';
import { useSelector } from 'react-redux';

/** Styles */
import { Typography, Colors } from '../../../../styles';

/** Util */
import { formatMoney } from '../../../../utils';

const ExtratoComp = ({ index, listExtract }: any) => {
  const {
    configurations = null,
  }: any = useSelector((state: any) => state);

  const totalMonth = () => {
    return listExtract[index].reduce((accumulator: any, currentValue: any) => {
      if (currentValue?.payment && currentValue?.payment?.driverTotal) {
        return accumulator + currentValue.payment.driverTotal;
      } else if (currentValue.price && currentValue.price > 0) {
        return accumulator + currentValue.price;
      }

      return accumulator;
    }, 0);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }} key={index}>
      <View style={{ height: '90%', width: '100%', alignItems: 'center' }}>
        {index &&
          Array.isArray(listExtract[index]) &&
          listExtract[index].length > 0 ? (
          <>
            <View style={styles.container}>
              <View style={styles.contain}>
                <Text style={styles.value}>
                  {listExtract[index][0].monthTxt}
                </Text>
                <Text style={styles.value}>{formatMoney(totalMonth(), configurations?.coin)}</Text>
              </View>
            </View>

            {listExtract[index].map((item: any) => {
              return (
                <View style={styles.containExtrato} key={item._id}>
                  <Text style={styles.extrato}>
                    {moment(item.createdAt).format('DD/MM HH:mm')}
                  </Text>
                  <Text style={styles.extrato}>{formatMoney(item.price, configurations?.coin)}</Text>
                </View>
              );
            })}
          </>
        ) : null}

        {/* <View style={styles.total}>
          <Text style={styles.totalpag}>Pag pedido nº 1182</Text>
          <Text style={styles.totalpag}>- 46,00</Text>
        </View> */}

        {/* <View style={styles.container}>
          <View style={styles.contain}>
            <Text style={styles.value}>Março 2021</Text>
            <Text style={styles.value}> 53,20</Text>
          </View>
        </View> */}

        {/* <Item /> */}
      </View>
    </View>
  );
};

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
    height: '100%',
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

export default ExtratoComp;
