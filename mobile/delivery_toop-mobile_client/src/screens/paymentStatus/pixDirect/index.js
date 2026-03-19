/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Container,
  KeyTitle,
  AwaitingPayment,
  AwaitingPaymentTxt,
  IconContent,
  ContentMessage,
  Message,
  ButtonCopy,
  ButtonCopyTxt,
  CopySuccess,
  CopySuccessTxt,
  BtnMethod,
  KeyContainer,
  PaymentProofTitle,
  PaymentProofValue,
  PaymentProofContainer,
} from './styles';
import Clipboard from '@react-native-community/clipboard';
import { Linking } from 'react-native';

/** Service */
import { verifyPixPayment } from '../../../services/service/pix/verifyPixPayment';
import { StorageClean } from '../../../services/deviceStorage';

const PixDirect = ({ modal, company, orderNumber }) => {
  const [isMessage, setMessage] = useState(false);

  const pixKey = company?.bankData?.pixKey;
  const companyPhone = company?.phone;

  const copyToClipboard = () => {
    try {
      if (!pixKey)
        return;

      Clipboard.setString(pixKey);
      setMessage(true);
      setTimeout(() => {
        setMessage(false);
      }, 5000);
    } catch (err) {
      console.log('fail', err);
    }
  };

  const openWhatsapp = () => {
    Linking.openURL(
      `https://api.whatsapp.com/send?phone=${companyPhone}&text=Olá! Fiz o pedido N°${orderNumber} e irei mandar o comprovante`,
    );
  }

  return (
    <Container>
      {isMessage ? (
        <CopySuccess>
          <CopySuccessTxt>Chave copiado com sucesso</CopySuccessTxt>
        </CopySuccess>
      ) : null}

      <AwaitingPayment>
        <AwaitingPaymentTxt>Pedido aguardando pagamento ...</AwaitingPaymentTxt>
      </AwaitingPayment>

      <ContentMessage>
        <Message>
          Copie a chave abaixo e a utilize no aplicativo que você vai
          fazer o pagamento
        </Message>
      </ContentMessage>

      <KeyContainer onPress={() => copyToClipboard()}>
        <KeyTitle numberOfLines={1} selectable>{pixKey}</KeyTitle>
        <IconContent>
          <Icon size={20} name="content-copy" />
        </IconContent>
      </KeyContainer>

      <PaymentProofContainer>
        <PaymentProofTitle numberOfLines={1}>
          Enviar comprovante para:
        </PaymentProofTitle>

        <PaymentProofValue numberOfLines={1} selectable>
          {companyPhone}
        </PaymentProofValue>
      </PaymentProofContainer>

      <ButtonCopy onPress={() => copyToClipboard()}>
        <ButtonCopyTxt>Copiar chave</ButtonCopyTxt>
      </ButtonCopy>

      <BtnMethod onPress={openWhatsapp} primary>
        <ButtonCopyTxt>Abrir whatsapp</ButtonCopyTxt>
      </BtnMethod>

      <BtnMethod onPress={modal}>
        <ButtonCopyTxt>Já enviei</ButtonCopyTxt>
      </BtnMethod>
    </Container>
  );
};

export default PixDirect;
