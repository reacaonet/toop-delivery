/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Container,
  TextQrCode,
  CopyQrCode,
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
  ContentQrcode,
  ImageQrcode,
} from './styles';
import Clipboard from '@react-native-community/clipboard';

/** Service */
import {verifyPixPayment} from '../../../../services/service/pix/verifyPixPayment';
import {StorageClean} from '../../../../services/deviceStorage';

const PixQrCode = ({navigation, modal, cart, barCode, qrcode}) => {
  const [isMessage, setMessage] = useState(false);
  const interval = useRef(null);

  useEffect(() => {
    interval.current = setInterval(() => {
      verifyPixPayment(cart?._id).then(async result => {
        if (
          result &&
          result.register === true &&
          result.payment &&
          result.payment._id
        ) {
          // pagamento confirmado
          modal(false);
          await StorageClean('@pix-active');
          return navigation.navigate('Shopping', {
            screen: 'PaymentStatus',
            params: {
              paymentId: result.payment._id,
            },
          });
        }
      });
    }, 17000);

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  }, []);

  const copyToClipboard = () => {
    try {
      Clipboard.setString(barCode);
      setMessage(true);
      setTimeout(() => {
        setMessage(false);
      }, 5000);
    } catch (err) {
      console.log('fail', err);
    }
  };

  const changeMethodPayment = async () => {
    await StorageClean('@pix-active');
    modal(false);
  };

  return (
    <Container>
      {isMessage ? (
        <CopySuccess>
          <CopySuccessTxt>Código copiado com sucesso</CopySuccessTxt>
        </CopySuccess>
      ) : null}

      <AwaitingPayment>
        <AwaitingPaymentTxt>Pedido aguardando pagamento ...</AwaitingPaymentTxt>
      </AwaitingPayment>
      <ContentQrcode>
        {qrcode ? <ImageQrcode source={{uri: `${qrcode}`}} /> : null}
      </ContentQrcode>

      <ContentMessage>
        <Message>
          Copie o código abaixo e utilize o Pix Copie no aplicativo que você vai
          fazer o pagamento
        </Message>

        <Message>Voce tem até 5 minutos para fazer o pagamento</Message>
      </ContentMessage>

      <CopyQrCode onPress={() => copyToClipboard()}>
        <TextQrCode numberOfLines={1}>{barCode}</TextQrCode>
        <IconContent>
          <Icon size={20} name="content-copy" />
        </IconContent>
      </CopyQrCode>

      <ButtonCopy onPress={() => copyToClipboard()}>
        <ButtonCopyTxt>Copiar código</ButtonCopyTxt>
      </ButtonCopy>

      <BtnMethod onPress={() => changeMethodPayment()}>
        <ButtonCopyTxt>Alterar Forma Pagamento</ButtonCopyTxt>
      </BtnMethod>
    </Container>
  );
};

export default PixQrCode;
