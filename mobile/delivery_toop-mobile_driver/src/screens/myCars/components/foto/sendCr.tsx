import React from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { TouchButtonLogin, TxtButtonLogin } from './styles';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { Typography, Colors } from '../../../../styles';

import pickFile from './../../../register/Camera';

interface Props {
  onPress?: any;
  goBack?: any;
  submit?: any;
}

const SendCr: React.FC<Props> = ({ onPress, goBack, submit }) => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [text, setText] = React.useState('');

  const selectImage = async () => {
    try {
      const data = await pickFile('camera', 'photo');

      if (!data?.uri) {
        return;
      }

      navigation.navigate('ConfirmCrlv', {
        photo: data,
        car: route.params?.car || {},
      });
    } catch (err: any) {
      Alert.alert('Erro ao tirar foto', err.message);
    }
  };

  return (
    <View>
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity onPress={goBack}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.center}>
        <View style={styles.loginPhoneContainer}>
          <Text style={styles.title}>
            Tire e envie uma <Text style={styles.sub}>foto</Text> do Certificado
            de
          </Text>
          <Text style={styles.title}>
            Registro e Licenciamento do Veículo - CRLV
          </Text>
        </View>
        <View style={{ marginTop: 20 }} />
        <Text style={styles.req}>
          ∙ A categoria do veículo precisa ser "particular"
        </Text>
        <Text style={styles.req}>∙ Veículo 4 portas - Ano mínimo: 2010</Text>
        <Text style={styles.req}>
          ∙ Certifique-se de que todas as informações
        </Text>
        <Text style={styles.req}> estejam legíveis e sem cortes.</Text>
        <Text style={styles.req}>
          ∙ O documento deve estar aberto como na figura abaixo.
        </Text>

        <Image
          style={styles.image}
          source={require('../../../../assets/images/crlv.png')}
        />

        <TouchButtonLogin onPress={() => selectImage()}>
          <TxtButtonLogin>TIRAR FOTO</TxtButtonLogin>
        </TouchButtonLogin>
        <View style={{ marginBottom: 40 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconGoBack: {
    color: Colors.BLACK,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  loginPhoneContainer: {
    width: '90%',
    marginTop: 20,
  },
  title: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_DARK,
  },
  generate: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },
  sub: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    fontWeight: 'bold',
    color: Colors.GRAY_DARK,
  },

  req: {
    fontSize: Typography.FONT_SIZE_13,
    alignSelf: 'flex-start',
    marginLeft: 15,
    marginTop: 2,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_DARK,
  },

  image: {
    width: '30%',
    height: '30%',
    marginTop: 20,
    marginBottom: 10,
  },

  safeAreaView: {
    marginTop: 20,
  },
});

export default SendCr;
