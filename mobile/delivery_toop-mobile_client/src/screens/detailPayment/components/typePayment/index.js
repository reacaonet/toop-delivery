import React from 'react';
import {useSelector} from 'react-redux';

import {
  Header,
  HeaderBody,
  TextHeader,
  Image,
  Body,
  ViewPayment,
  TouchChange,
  TextChange,
  StreakView,
  WinCashBack,
  WinCashBackText,
  WinCashBackPrice,
} from './Style';

import {Colors, Typography} from '../../../../styles';

import CardTypePayment from '../cardTypePayment';
import MoneyTypePayment from '../moneyTypePayment';
import imgPaymentType from './images/paymentType.png';
import FinanceTypePayment from '../financeTypePayment';
import PIXPayment from '../pix';
import imgCashback from '../../../../assets/images/cashback.png';

import {formatMoney} from '../../../../utils';

const TypePayment = ({
  paymentType,
  card,
  changeMoney,
  navigation,
  company,
  total,
  typeCard,
  haveCard,
  setHaveCard,
  availableCashback,
  paymentsAccepted,
}) => {
  const {configurations = null} = useSelector(state => state);

  const goPaymentMethods = newRegister => {
    // if (newRegister && paymentType !== 'FINANCE') {
    //   return;
    // }

    navigation.navigate('PaymentMethods', {
      redirectPayment: true,
      newRegister,
      company,
      total,
      paymentsAccepted,
    });
  };

  return (
    <>
      {availableCashback > 0 ? (
        <Header style={{marginBottom: 20}}>
          <WinCashBack>
            <Image source={imgCashback} />
            <WinCashBackText>RECEBA CASHBACK</WinCashBackText>
            <WinCashBackPrice>
              + {formatMoney(availableCashback, configurations?.coin)}
            </WinCashBackPrice>
          </WinCashBack>
        </Header>
      ) : null}

      <Header>
        <HeaderBody>
          <TextHeader>Forma de pagamento</TextHeader>
          <Image source={imgPaymentType} />
        </HeaderBody>
      </Header>
      <Body>
        <ViewPayment>
          <CardTypePayment
            card={card}
            typeCard={typeCard}
            paymentType={paymentType}
            paymentsAccepted={paymentsAccepted}
          />
          <MoneyTypePayment
            changeMoney={changeMoney}
            paymentType={paymentType}
            paymentsAccepted={paymentsAccepted}
          />

          {paymentType === 'FINANCE' &&
          paymentsAccepted.find(
            i =>
              i.type === 'BRASPAG' || i.type === 'PAGARME' || i.type === 'IUGU',
          ) ? (
            <FinanceTypePayment
              paymentType={paymentType}
              goPaymentMethods={goPaymentMethods}
              haveCard={haveCard}
              setHaveCard={setHaveCard}
              paymentsAccepted={paymentsAccepted}
            />
          ) : null}

          <PIXPayment
            navigation={navigation}
            paymentType={paymentType}
            paymentsAccepted={paymentsAccepted}
          />
        </ViewPayment>
        <TouchChange onPress={() => goPaymentMethods(false)}>
          {haveCard ? (
            <TextChange>Trocar</TextChange>
          ) : (
            <TextChange>Escolher</TextChange>
          )}
        </TouchChange>
      </Body>
    </>
  );
};

export default TypePayment;
