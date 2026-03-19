import React from 'react';

import {
  Image,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
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
import { Typography, Colors } from '../../../../styles';

interface Props {
  submit: any;
  goBack: any;
  again: any;
  uri: string;
}

const ConfirmCriminal: React.FC<Props> = ({ goBack, submit, again, uri }) => {
  return (
    <>
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
      <Image style={styles.image} source={{ uri }} />

      <ContentButton>
        <ButtonJump onPress={again}>
          <ButtonJumpText>Tirar Outra</ButtonJumpText>
        </ButtonJump>
        <ButtonPhoto onPress={submit}>
          <ButtonPhotoText>Enviar Foto</ButtonPhotoText>
        </ButtonPhoto>
      </ContentButton>
    </>
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
    width: '95%',
    height: '50%',
    marginTop: 20,
    alignSelf: 'center',
    borderRadius: 4,
    marginBottom: 10,
  },

  safeAreaView: {
    marginTop: 20,
  },
});

export default ConfirmCriminal;
