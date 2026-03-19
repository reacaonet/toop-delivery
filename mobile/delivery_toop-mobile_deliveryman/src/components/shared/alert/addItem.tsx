import React, {FunctionComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Colors, Typography} from '../../../styles';

type addItemtProps = {
  modal: Function;
  onConfirm: Function;
  title?: string;
  confirmTitle?: string;
  cancelTitle?: string;
};

const AddItem: FunctionComponent<addItemtProps> = ({
  modal,
  onConfirm,
  title,
  confirmTitle,
  cancelTitle,
}: addItemtProps) => {
  const goBack = () => {
    modal(false);
  };

  const goConfirm = () => {
    modal(false);
    onConfirm();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer} />
      <View style={styles.content}>
        <ScrollView>
          <Text style={styles.txtTitle}>Peraê!</Text>
          <Text style={styles.txtInfo}>
            {title ? title : 'Deseja Realmente Adicionar Item ?'}
          </Text>
          <View style={styles.btnItens}>
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => goBack()}>
                <Text style={styles.txtBtn}>
                  {cancelTitle ? cancelTitle : 'Não, voltar'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <TouchableOpacity
                style={styles.btnConfirm}
                onPress={() => goConfirm()}>
                <Text style={styles.txtBtnConfirm}>
                  {confirmTitle ? confirmTitle : 'Sim, claro!'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default AddItem;

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
    fontSize: 18,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    textAlign: 'center',
  },
  txtInfo: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
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
