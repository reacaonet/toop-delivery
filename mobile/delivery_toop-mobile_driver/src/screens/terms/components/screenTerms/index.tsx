import React from 'react';

import {
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

import {
  TextTitle,
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
  exit: any;
}

const Terms: React.FC<Props> = ({ goBack, submit, exit }) => {
  return (
    <>
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity onPress={goBack}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
        <TextBold>TERMOS E CONDIÇÕES DE USO</TextBold>
        <TextSelf>Você precisa aceitar para continuar</TextSelf>
      </SafeAreaView>
      <ScrollView style={styles.scroll}>
        <TextInstruction>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </TextInstruction>
        <TextTitle>OBJETO</TextTitle>
        <TextInstruction>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </TextInstruction>
        <TextTitle>AO APLICATIVO PELO USUÁRIO</TextTitle>
        <TextInstruction>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </TextInstruction>
        <TextTitle>
          ISENÇÃO DE GARANTIAS E LIMITAÇÕES DE RESPONSABILIDADE
        </TextTitle>
        <TextInstruction>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </TextInstruction>
        <TextTitle>DIREITOS AUTORAIS</TextTitle>
        <TextInstruction>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </TextInstruction>
        <TextTitle>
          POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS SOLICITADOS
        </TextTitle>
        <TextInstruction>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </TextInstruction>
        <TextTitle>OBJETIVO DA COLETA DE DADOS</TextTitle>
        <TextInstruction>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </TextInstruction>
        <TextTitle>PREECISÃO DOS DADOS</TextTitle>
        <TextInstruction>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </TextInstruction>
        <TextTitle>CONSENTIMENTO PARA COLETA E USO DE DADOS</TextTitle>
        <TextInstruction>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </TextInstruction>
        <TextTitle>ALTERAÇÕES, MODIFICAÇÕES E RESCISÃO</TextTitle>
        <TextInstruction>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </TextInstruction>
        <TextTitle>INDEPENDÊNCIA DAS CLÁUSULAS</TextTitle>
        <TextInstruction>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </TextInstruction>
      </ScrollView>

      <ContentButton>
        <ButtonJump onPress={exit}>
          <ButtonJumpText>Não aceito</ButtonJumpText>
        </ButtonJump>
        <ButtonPhoto onPress={submit}>
          <ButtonPhotoText>Li e aceito</ButtonPhotoText>
        </ButtonPhoto>
      </ContentButton>
    </>
  );
};

const styles = StyleSheet.create({
  iconGoBack: {
    marginTop: 20,
    width: 60,
    height: 60,
    color: Colors.BLACK,
  },
  scroll: {
    height: '20%',
    marginBottom: 50,
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
    bottom: 0,
    marginTop: -20,
    marginLeft: -20,
    marginRight: -20,
    backgroundColor: Colors.GRAY_LIGHT,
    marginBottom: 10,
  },
});

export default Terms;
