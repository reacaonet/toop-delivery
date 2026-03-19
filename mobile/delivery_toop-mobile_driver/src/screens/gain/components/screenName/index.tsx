import React from 'react';

import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { Typography, Colors } from '../../../../styles';

interface Props {
  gain: any;
  goBack: any;
  submit: any;
}

const Gain: React.FC<Props> = ({ goBack, submit, gain }) => {
  const { t } = useTranslation();
  const [text, setText] = React.useState('');

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
            <Text style={styles.title2}>ÚLTIMA VIAGEM</Text>
            <Text style={styles.title2}>{t('monetary')} 32,50</Text>
          </View>
          <Text style={styles.subTitle}>Hoje · 12:25 · 20km</Text>

          <View style={styles.street}>
            <View style={styles.line}>
              <View style={styles.triangulo} />
              <View style={styles.route} />
              <View style={styles.ball} />
            </View>

            <View style={styles.box}>
              <Text style={styles.titleStreet}>
                Rua buriti, 363 - Jardim Mariliza, {'\n'}Goiânia - GO,
                74885-155, Brasil
              </Text>

              <Text style={styles.titleStreet}>
                Rua6, Unid.101 - Pq Atheneu {'\n'}Goiânia - GO, 74776-455,
                Brasil
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.containerTwo}>
          <View style={{ marginTop: 10 }}>
            <View style={styles.text}>
              <Text style={styles.title2}>HOJE</Text>
              <Text style={styles.title2}>{t('monetary')} 85,25</Text>
            </View>
            <Text style={styles.subTitle}>3 {t('races')} concluídas</Text>
          </View>
        </View>

        <View style={styles.containerThree}>
          <View style={styles.containButton}>
            <TouchableOpacity style={styles.button} onPress={submit}>
              <Text style={styles.history}>Histórico de {t('races')} </Text>
              <Icon name="navigate-next" size={25} style={styles.iconNext} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.containerThree}>
          <View style={styles.containButton}>
            <TouchableOpacity style={styles.button} onPress={gain}>
              <Text style={styles.history}>Histórico de ganhos </Text>
              <Icon name="navigate-next" size={25} style={styles.iconNext} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.containerFour}>
        <View style={styles.containGain}>
          <Text style={styles.balance}>Saldo atual </Text>
          <Text style={styles.balance}>{t('monetary')} 852,75</Text>
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
    height: 200,
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
    height: 60,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },

  containerFour: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', //Here is the trick
    bottom: 0,
    backgroundColor: Colors.RED,
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
  triangulo: {
    marginLeft: 10,
    marginTop: 30,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 0,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftWidth: 5,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.BLACK,
    borderLeftColor: 'transparent',
    transform: [{ rotate: '180deg' }],
  },

  route: {
    height: 20,
    marginTop: 10,
    marginLeft: 14.4,
    width: 1,
    backgroundColor: '#909090',
  },

  ball: {
    width: 8,
    height: 8,
    marginLeft: 10,
    marginTop: 10,
    borderRadius: 8 / 2,
    backgroundColor: Colors.BLACK,
  },

  street: {
    flexDirection: 'row',
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

  history: {
    marginBottom: 20,
    marginRight: 20,
    marginLeft: 20,
    marginTop: 5,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  iconNext: {
    color: Colors.BLACK,
    marginRight: 5,
    marginTop: 5,
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

export default Gain;
