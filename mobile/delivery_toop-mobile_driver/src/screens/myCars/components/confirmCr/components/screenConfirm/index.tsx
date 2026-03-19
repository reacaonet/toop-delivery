import React from 'react';

import {
  Image,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import {
  Container,
  TextBold,
  TextSelf,
  TextInstruction,
  ContentButton,
  ButtonPhoto,
  ButtonPhotoText,
  ButtonJump,
  ButtonJumpText,
} from './styles';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { Typography, Colors } from '../../../../../../styles';

interface Props {
  submit: any;
  goBack: any;
  again: any;
  photo?: any;
  load?: any;
}

const ConfirmCrlv: React.FC<Props> = ({
  goBack,
  submit,
  again,
  photo,
  load,
}) => {
  const [text, setText] = React.useState('');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity onPress={goBack}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
      </SafeAreaView>
      <TextSelf>Usar esta foto ?</TextSelf>
      <TextInstruction>
        Seus documentos serão analisados para validação.
      </TextInstruction>
      <TextInstruction>
        Acompanhe status no menu do modo motorista e fique
      </TextInstruction>
      <TextInstruction>
        sabendo de novas solicitações e/ou aprovações.
      </TextInstruction>
      <View style={{ marginBottom: 10 }} />

      {photo && photo?.uri ? (
        <Image
          style={styles.image}
          source={{ uri: photo?.uri }}
          resizeMode={'contain'}
        />
      ) : (
        <Image
          style={styles.image}
          source={require('../../../../../../assets/images/cnhConfirm.png')}
          resizeMode={'contain'}
        />
      )}

      <ContentButton>
        <ButtonJump onPress={again}>
          <ButtonJumpText>Tirar Outra </ButtonJumpText>
        </ButtonJump>
        {photo && photo?.uri ? (
          <ButtonPhoto onPress={submit}>
            {!load ? (
              <ButtonPhotoText>Enviar Foto</ButtonPhotoText>
            ) : (
              <ActivityIndicator size={'small'} color={'white'} />
            )}
          </ButtonPhoto>
        ) : null}
      </ContentButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    fontSize: Typography.FONT_SIZE_17,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_DARK,
    marginBottom: 20,
  },
  sub: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    fontWeight: 'bold',
    color: Colors.GRAY_DARK,
  },

  req: {
    fontSize: Typography.FONT_SIZE_12,
    alignSelf: 'flex-start',
    marginLeft: 15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_DARK,
  },

  image: {
    width: '100%',
    height: 200,
    marginTop: 20,
    alignSelf: 'center',
    borderRadius: 4,
    marginBottom: 10,
  },

  safeAreaView: {
    marginTop: 20,
  },
});

export default ConfirmCrlv;
