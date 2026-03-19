import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useSelector} from 'react-redux';

import {formatMoney} from '../../../../utils';
import {ViewIcon, ViewBody, TextName, styles} from './Styles';

const MoneyTypePayment = ({changeMoney, paymentType, paymentsAccepted}) => {
  const {configurations = null} = useSelector(state => state);

  if (
    !paymentType ||
    (paymentType && paymentType !== 'MONEY') ||
    !paymentsAccepted.find(i => i.type === 'MONEY')
  ) {
    return null;
  }

  return (
    <>
      <ViewIcon>
        <Icon name="attach-money" size={30} style={styles.iconCard} />
      </ViewIcon>
      <ViewBody>
        <TextName>Pagamento em dinheiro</TextName>
        <TextName>
          Troco para {formatMoney(changeMoney, configurations?.coin)}
        </TextName>
      </ViewBody>
    </>
  );
};

export default MoneyTypePayment;
