import React from 'react';

import {
  TextTitle,
  ViewTitle,
  ViewBox,
  TouchItem,
  ViewItem,
  TextItem,
  ImageCreditCard,
  ImageMoney,
  ImageLocalPayment,
  ImageIcon,
} from './Styles';

import Money from './images/money.png';
import LocalCard from './images/localCard.png';
import CreditCard from './images/creditCard.png';
import NavigateNext from './images/navigateNext.png';
import PIXImage from './images/pix.png';

const PaymentType = ({
  typePayments,
  setLoadMethod,
  setModalPaymentMoney,
  setModalLocalCreditCard,
  setPix,
  setPixDirect,
  confirmRide,
  moneySelect,
}) => {
  return (
    <>
      <ViewTitle>
        <TextTitle>Adicionar forma de pagamento</TextTitle>
      </ViewTitle>
      <ViewBox>
        {(!typePayments ||
          (typePayments && typePayments.length === 0) ||
          (typePayments?.PAGARME ||
            typePayments?.BRASPAG ||
            typePayments.IUGU)) && (
            <TouchItem onPress={() => setLoadMethod(true)}>
              <ViewItem>
                <ImageCreditCard source={CreditCard} resizeMode="contain" />
                <TextItem>Cartão de Crédito</TextItem>
              </ViewItem>
              <ImageIcon source={NavigateNext} />
            </TouchItem>
          )}

        {confirmRide ? (
          <TouchItem onPress={() => moneySelect()}>
            <ViewItem>
              <ImageMoney source={Money} resizeMode="contain" />
              <TextItem>Pagar com dinheiro</TextItem>
            </ViewItem>
            <ImageIcon source={NavigateNext} />
          </TouchItem>
        ) : null}

        {typePayments?.MONEY && (
          <TouchItem onPress={() => setModalPaymentMoney()}>
            <ViewItem>
              <ImageMoney source={Money} resizeMode="contain" />
              <TextItem>Pagar com dinheiro</TextItem>
            </ViewItem>
            <ImageIcon source={NavigateNext} />
          </TouchItem>
        )}
        {typePayments?.PIX && (
          <TouchItem onPress={() => setPix()}>
            <ViewItem>
              <ImageLocalPayment source={PIXImage} resizeMode="contain" />
              <TextItem>PIX</TextItem>
            </ViewItem>
            <ImageIcon source={NavigateNext} />
          </TouchItem>
        )}
        {typePayments?.PIX_DIRECT && (
          <TouchItem onPress={() => setPixDirect()}>
            <ViewItem>
              <ImageLocalPayment source={PIXImage} resizeMode="contain" />
              <TextItem>Transferência PIX</TextItem>
            </ViewItem>
            <ImageIcon source={NavigateNext} />
          </TouchItem>
        )}
        {typePayments?.CARD && (
          <TouchItem onPress={() => setModalLocalCreditCard(true)}>
            <ViewItem>
              <ImageLocalPayment source={LocalCard} resizeMode="contain" />
              <TextItem>Cartão no local</TextItem>
            </ViewItem>
            <ImageIcon source={NavigateNext} />
          </TouchItem>
        )}
      </ViewBox>
    </>
  );
};

export default PaymentType;
