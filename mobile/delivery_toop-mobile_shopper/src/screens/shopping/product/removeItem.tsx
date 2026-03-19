import React, {FunctionComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Colors, Typography} from '../../../styles';
import CardShadow from '../../../components/shared/cardShadow';

type RemoveItemtProps = {
  modal: Function;
  onConfirm: Function;
};

const RemoveItem: FunctionComponent<RemoveItemtProps> = ({
  modal,
  onConfirm,
}: RemoveItemtProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer} />
      <View style={styles.content}>
        <ScrollView>
          <Text style={styles.txtTitle}>Peraê!</Text>
          <Text style={styles.txtInfo}>Deseja Realmente remover Item ?</Text>
          <View style={styles.btnItens}>
            <View style={styles.card}>
              <CardShadow>
                <TouchableOpacity
                  style={styles.btnCancel}
                  onPress={() => modal(false)}>
                  <Text style={styles.txtBtn}>Não, voltar</Text>
                </TouchableOpacity>
              </CardShadow>
            </View>

            <View style={styles.card}>
              <CardShadow>
                <TouchableOpacity
                  style={styles.btnConfirm}
                  onPress={() => onConfirm()}>
                  <Text style={styles.txtBtnConfirm}>Sim, claro!</Text>
                </TouchableOpacity>
              </CardShadow>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default RemoveItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  headerContainer: {
    flex: 1,
  },
  content: {
    height: 140,
    backgroundColor: Colors.WHITE,
    borderTopWidth: 0.1,
    borderColor: Colors.GREY,
  },
  txtTitle: {
    marginTop: 10,
    fontSize: Typography.FONT_SIZE_18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  txtInfo: {
    marginTop: 10,
    fontSize: Typography.FONT_SIZE_14,
    textAlign: 'center',
  },
  btnItens: {
    flexDirection: 'row',
  },
  card: {
    flex: 1,
  },
  txtBtn: {
    fontSize: Typography.FONT_SIZE_14,
    fontWeight: 'bold',
    color: Colors.WHITE,
    textAlign: 'center',
  },
  txtBtnConfirm: {
    fontSize: Typography.FONT_SIZE_14,
    color: Colors.WHITE,
    textAlign: 'center',
  },
  btnCancel: {
    flex: 1,
    margin: 10,
    padding: 10,
    backgroundColor: Colors.SECONDARY_DARK,
  },
  btnConfirm: {
    flex: 1,
    margin: 10,
    padding: 10,
    backgroundColor: Colors.SUCCESS,
  },
});
