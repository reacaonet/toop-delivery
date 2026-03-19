import React, {FunctionComponent} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {Colors, Typography} from '../../../styles';
import CardShadow from '../cardShadow';

const IsNotConnected: FunctionComponent = () => {
  return (
    <View
      style={{
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-end',
        flex: 1,
      }}>
      <View style={styles.container}>
        <View>
          <Text style={styles.txtTitle}>Oops!</Text>
          <Text style={styles.txtInfo}>Você não está conectado a internet</Text>
          <View style={styles.btnItens}>
            <View style={styles.card}>
              {/* <CardShadow> */}
              <TouchableOpacity style={styles.btnConfirm} disabled>
                <Text style={styles.txtBtnConfirm}>
                  Por favor, verifique sua conexão e tente novamente!
                </Text>
              </TouchableOpacity>
              {/* </CardShadow> */}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default IsNotConnected;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: Colors.BLUE_DARK,
    paddingBottom: 30,
    borderTopWidth: 0.1,
    borderColor: Colors.GREY,
    shadowColor: Colors.GREY,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowRadius: 1,
    shadowOpacity: 0.1,
    elevation: 3,
  },

  txtTitle: {
    marginTop: 30,
    fontSize: 18,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    textAlign: 'center',
    color: Colors.WHITE,
  },
  txtInfo: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
    color: Colors.WHITE,
  },
  btnItens: {
    flexDirection: 'row',
  },
  card: {
    flex: 1,
  },
  txtBtn: {
    fontSize: 14,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    color: Colors.WHITE,
    textAlign: 'center',
  },
  txtBtnConfirm: {
    fontSize: 14,
    lineHeight: 18,
    color: Colors.WHITE,
    textAlign: 'center',
  },
  btnConfirm: {
    margin: 20,
    backgroundColor: Colors.SUCCESS,

    padding: 15,

    borderRadius: 5,
  },
});
