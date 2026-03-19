import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { ViewIcon, ViewBody, TextName, styles } from './Styles';

const PIXPayment = ({ paymentType, paymentsAccepted }) => {
  if (
    !paymentType ||
    (paymentType && paymentType !== 'PIX' && paymentType !== 'PIX_DIRECT') ||
    !paymentsAccepted.find(i => i.type === paymentType)
  ) {
    return null;
  }

  return (
    <>
      <ViewIcon>
        <Icon name="attach-money" size={30} style={styles.iconCard} />
      </ViewIcon>
      <ViewBody>
        <TextName>Pagamento por PIX</TextName>
      </ViewBody>
    </>
  );
};

export default PIXPayment;
