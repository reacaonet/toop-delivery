import React, { useCallback, useState } from 'react';

import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Hands from 'react-native-vector-icons/FontAwesome';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

import { Typography, Colors } from '../../../styles';
import { formatMoney } from '../../../utils';

/** Service */
import { bookingDriverHistoric } from '../../../services/provider/booking/bookingDriverHistoric';

interface Props {
  histgain: any;
  goBack: any;
  submit: any;
  histcar: any;
}

const Wallet: React.FC<Props> = ({ goBack, submit, histcar, histgain }) => {
  const {
    authUser: { user = null },
    configurations = null,
  }: any = useSelector((state: any) => state);

  const [totalReceivable, setTotalReceivable] = useState(0);

  useFocusEffect(
    useCallback(() => {
      bookingDriverHistoric(user?._id, {
        onlyTotal: true,
      }).then(result => {
        if (result && result.total) {
          setTotalReceivable(result.total);
        } else {
          setTotalReceivable(0);
        }
      });
    }, [user]),
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity onPress={goBack}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
        <Text style={styles.title}>GANHOS</Text>
      </SafeAreaView>

      <View style={{ height: '90%', width: '100%', alignItems: 'center' }}>
        <View style={styles.container}>
          <View style={styles.text}>
            <Text style={styles.title2}>Saldo</Text>
          </View>

          <Text style={styles.value}>
            {formatMoney(totalReceivable, configurations?.coin)}
          </Text>
        </View>
        <View style={styles.containerThree}>
          <View style={styles.containButton}>
            <TouchableOpacity style={styles.button} onPress={submit}>
              <Text style={styles.history}>Extrato e recibos</Text>
              <Icon name="navigate-next" size={25} style={styles.iconNext} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.containerThree}>
          <View style={styles.containButton}>
            <TouchableOpacity style={styles.button} onPress={histcar}>
              <Text style={styles.history}>Histórico de corridas </Text>
              <Icon name="navigate-next" size={25} style={styles.iconNext} />
            </TouchableOpacity>
          </View>
        </View>

        {/* <View style={styles.containerThree}>
          <View style={styles.containButton}>
            <TouchableOpacity style={styles.button} onPress={histgain}>
              <Text style={styles.history}>Histórico de ganhos </Text>
              <Icon name="navigate-next" size={25} style={styles.iconNext} />
            </TouchableOpacity>
          </View>
        </View> */}

        <View style={styles.containerThree}>
          <View style={styles.containButton}>
            <TouchableOpacity style={styles.button}>
              <Hands name="handshake-o" size={20} style={styles.hands} />
              <Text style={styles.history2}>Indicações</Text>
              <Icon name="navigate-next" size={25} style={styles.iconNext} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconGoBack: {
    color: Colors.BLACK,
    marginLeft: 5,
  },

  safeAreaView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  container: {
    width: '90%',
    height: 120,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },

  containerTwo: {
    width: '90%',
    height: 80,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },
  containerThree: {
    width: '90%',
    height: 50,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },

  text: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  title: {
    marginTop: 10,
    marginRight: 20,
    fontWeight: 'bold',
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  title2: {
    marginTop: 10,
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  value: {
    bottom: 10,
    paddingRight: 20,
    position: 'absolute',
    width: '100%',
    textAlign: 'right',
    fontSize: Typography.FONT_SIZE_30,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  subTitle: {
    marginTop: 5,
    marginRight: 10,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  titleStreet: {
    marginTop: 20,
    marginRight: 10,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },
  line: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 10,
  },

  box: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 10,
  },

  containButton: {
    marginTop: 15,
    height: '100%',
  },

  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  button2: {
    flexDirection: 'row',
  },

  history: {
    marginBottom: 20,
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  history2: {
    marginBottom: 20,
    width: '70%',
    textAlign: 'left',
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },
  iconNext: {
    color: Colors.BLACK,
    marginRight: 5,
  },
  iconInd: {
    color: Colors.BLACK,
    textAlign: 'right',
    marginLeft: 120,
  },

  hands: {
    color: Colors.BLACK,
    marginLeft: 20,
  },
  balance: {
    color: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_20,
    marginRight: 50,
    marginLeft: 50,
  },

  containGain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default Wallet;
