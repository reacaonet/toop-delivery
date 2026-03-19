import React, {FunctionComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Colors, Typography} from '../../../styles';

type typeDocumentsProps = {
  modal: Function;
  goTakePictures: Function;
};

const TypeDocuments: FunctionComponent<typeDocumentsProps> = ({
  modal,
  goTakePictures,
}: typeDocumentsProps) => {
  const goConfirm = (quantity: number) => {
    modal(false);
    goTakePictures(quantity);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer} />
      <View style={styles.content}>
        <ScrollView>
          <Text style={styles.txtTitle}>Fala pra gente!</Text>
          <Text style={styles.txtInfo}>Qual deles é o seu?</Text>
          <View style={styles.btnItens}>
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.btnContinue}
                onPress={() => goConfirm(2)}>
                <Text style={styles.txtBtnContinue}>RG com cpf</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <TouchableOpacity
                style={styles.btnContinue}
                onPress={() => goConfirm(4)}>
                <Text style={styles.txtBtnContinue}>RG e CPF separados</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default TypeDocuments;

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
  txtBtnContinue: {
    fontSize: 14,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    color: Colors.WHITE,
    textAlign: 'center',
  },
  btnContinue: {
    flex: 1,
    margin: 10,
    padding: 10,
    backgroundColor: Colors.PRIMARY,
  },
});
