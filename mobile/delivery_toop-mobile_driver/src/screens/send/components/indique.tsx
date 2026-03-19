import React from 'react';

import {
  Text,
  View,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Share,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import Icon from 'react-native-vector-icons/MaterialIcons';
import Sharing from 'react-native-vector-icons/FontAwesome';

import { Typography, Colors } from '../../../styles';

/*
interface Props {
  goBack: any
}
 */

const onShare = async () => {
  try {
    const result = await Share.share({
      message:
        'React Native | A framework for building native apps using React',
    });
    if (result.action === Share.sharedAction) {
      if (result.activityType) {
      } else {
      }
    } else if (result.action === Share.dismissedAction) {
    }
  } catch (error: any) {
    Alert.alert(error.message);
  }
};

function Indique({ goBack }: any) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity onPress={goBack}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
      </SafeAreaView>
      <KeyboardAvoidingView>
        <View style={styles.center}>
          <Image source={require('../../../assets/images/hands.png')} />
        </View>
        <Text style={styles.title}>Indique e ganhe!</Text>
        <Text style={styles.text}>
          Indique amigos, vizinhos, {'\n'} parentes... Quem quiser! e ganhe{' '}
          {'\n'} {t('monetary')} 20,00 em cada indicação!
        </Text>

        <View style={styles.button}>
          <TouchableOpacity onPress={onShare}>
            <View style={styles.containButton}>
              <Sharing name="share-square-o" size={30} style={styles.share} />
              <Text style={styles.textButton}>Indicar</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.text}>
          Após a primeira corrida da pessoa{'\n'} indicada o valor é convertido
          em créditos {'\n'}e transferido para a carteira
        </Text>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },

  iconGoBack: {
    color: Colors.BLACK,
  },

  title: {
    marginTop: 20,
    textAlign: 'center',
    color: Colors.BLACK,
    fontSize: Typography.FONT_SIZE_16,
  },

  text: {
    marginTop: 20,
    textAlign: 'center',
    color: Colors.GRAY_DARK,
    fontSize: Typography.FONT_SIZE_16,
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },

  button: {
    marginTop: 20,
    width: '90%',
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.ALERT,
    alignSelf: 'center',
  },

  textButton: {
    color: Colors.WHITE,
    textAlign: 'right',
    marginRight: 10,
    fontSize: Typography.FONT_SIZE_22,
    width: '50%',
    marginTop: 15,
  },

  containButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  share: {
    color: Colors.WHITE,
    marginTop: 15,
    marginLeft: 10,
  },

  safeAreaView: {
    marginTop: 20,
  },
});

export default Indique;
