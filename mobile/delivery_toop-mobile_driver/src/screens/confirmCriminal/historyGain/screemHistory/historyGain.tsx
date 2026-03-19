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
import { Typography, Colors } from '../../../../styles';
import { useTranslation } from 'react-i18next';

interface Props {
  goBack: any;
}

const History: React.FC<Props> = ({ goBack }) => {
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

      <View style={styles.container}>
        <View style={styles.text}>
          <Text style={styles.title2}>{t('races')}</Text>
          <Text style={styles.title2}>Ganhos</Text>
        </View>

        <View style={styles.text}>
          <Text style={styles.subTitle}>35</Text>
          <Text style={styles.subTitle}>{t('monetary')} 732,10</Text>
        </View>

        <View style={styles.borderLine} />

        <View style={{ marginTop: 10, flexDirection: 'row' }}>
          <Icon name="navigate-before" size={24} style={styles.iconBack} />

          <Text style={styles.day}>01 de mar - 08 de mar</Text>
        </View>
      </View>

      <ScrollView style={{ marginTop: 60, height: '100%' }}>
        <View style={styles.containerThree}>
          <Text style={styles.history}>DOM · 11</Text>
          <Text style={styles.history2}>{t('monetary')} 52,00</Text>
        </View>
        <View style={styles.containSix}>
          <Text style={styles.history}>SEG · 12</Text>
          <Text style={styles.history2}>{t('monetary')} 52,00</Text>
        </View>
        <View style={styles.containerThree}>
          <Text style={styles.history}>TER · 13</Text>
          <Text style={styles.history2}>{t('monetary')} 52,00</Text>
        </View>

        <View style={styles.containSix}>
          <Text style={styles.history}>QUA · 14</Text>
          <Text style={styles.history2}>{t('monetary')} 52,00</Text>
        </View>

        <View style={styles.containerThree}>
          <Text style={styles.history}>QUI · 15</Text>
          <Text style={styles.history2}>{t('monetary')} 52,00</Text>
        </View>

        <View style={styles.containSix}>
          <Text style={styles.history}>SEX · 16</Text>
          <Text style={styles.history2}>{t('monetary')} 52,00</Text>
        </View>

        <View style={styles.containerThree}>
          <Text style={styles.history}>SAB · 17</Text>
          <Text style={styles.history2}>{t('monetary')} 52,00</Text>
        </View>

        <View style={styles.containSix}>
          <Text style={styles.history}>SEX · 16</Text>
          <Text style={styles.history2}>{t('monetary')} 52,00</Text>
        </View>

        <View style={styles.containerThree}>
          <Text style={styles.history}>SAB · 17</Text>
          <Text style={styles.history2}>{t('monetary')} 52,00</Text>
        </View>

        <View style={styles.containSix}>
          <Text style={styles.history}>SEX · 16</Text>
          <Text style={styles.history2}>{t('monetary')} 52,00</Text>
        </View>

        <View style={styles.containerThree}>
          <Text style={styles.history}>SAB · 17</Text>
          <Text style={styles.history2}>{t('monetary')} 52,00</Text>
        </View>

        <View style={styles.containSix}>
          <Text style={styles.history}>SEX · 16</Text>
          <Text style={styles.history2}>{t('monetary')} 52,00</Text>
        </View>

        <View style={styles.containerThree}>
          <Text style={styles.history}>SAB · 17</Text>
          <Text style={styles.history2}>{t('monetary')} 52,00</Text>
        </View>
      </ScrollView>

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
  iconBack: {
    color: Colors.TEXT,
    marginLeft: 10,
  },
  day: {
    color: Colors.BLACK,
    width: '80%',
    marginLeft: '20%',
    alignItems: 'center',
  },
  safeAreaView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  container: {
    width: '90%',
    height: '25%',
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },
  borderLine: {
    width: '90%',
    marginTop: 20,
    alignSelf: 'center',
    borderColor: Colors.WHITE,
    borderWidth: 1,
  },
  scroll: {
    height: '100%',
    marginTop: 20,
    alignSelf: 'center',
  },
  containerThree: {
    width: '100%',
    height: '30%',
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  containSix: {
    width: '100%',
    height: '30%',
    backgroundColor: Colors.WHITE,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  containerFour: {
    width: '100%',
    height: '15%',
    backgroundColor: Colors.GRAY_LIGHT,
  },

  text: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  title: {
    marginTop: 10,
    marginRight: 20,
    fontWeight: 'bold',
    fontSize: Typography.FONT_SIZE_17,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  title2: {
    marginTop: 10,
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_17,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  subTitle: {
    marginTop: 5,
    marginRight: 10,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  history: {
    marginLeft: 10,
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  history2: {
    marginRight: 10,
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  balance: {
    color: Colors.TEXT,
    fontWeight: 'bold',
    fontSize: Typography.FONT_SIZE_16,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 30,
  },

  containGain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default History;
