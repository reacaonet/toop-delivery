/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  ViewIcon,
  ViewBody,
  TxtCard,
  styles,
  ViewLoading,
  TextLoading,
} from './Styles';

import {isAuthenticated} from '../../../../services/userAuth';
import {listPaymentMethod} from '../../../../services/service/shopping/paymentMethod';

const FinanceTypePayment = props => {
  const {haveCard, paymentType, navigation, setHaveCard} = props;
  const [loader, setLoader] = useState(false);
  const [methodPayment, setMethodPayment] = useState(null);

  const {paymentsAccepted} = props;

  // if (
  //   !paymentType ||
  //   (paymentType && paymentType !== 'FINANCE') ||
  //   !paymentsAccepted.find(i => i.type === 'BRASPAG' || i.type === 'PAGARME')
  // ) {
  //   return null;
  // }

  useFocusEffect(
    useCallback(() => {
      paymentMethods();
    }, []),
  );

  const paymentMethods = async () => {
    setLoader(true);
    const {user: userAuth} = await isAuthenticated();
    const list = await listPaymentMethod(userAuth._id);

    /* if (list == null || list.length <= 0) {
      goPaymentMethods(true);
      return;
    } */

    if (list.length) {
      setHaveCard(true);
      setMethodPayment(list.filter(c => c.isMain === true)[0]);
    } else {
      console.log('else');
      setMethodPayment('Escolha um método');
    }

    setLoader(false);
  };

  return (
    <>
      {loader ? (
        <ViewLoading>
          <TextLoading>Carregando...</TextLoading>
        </ViewLoading>
      ) : (
        <>
          <ViewIcon>
            <Icon name="credit-card" size={30} style={styles.iconCard} />
          </ViewIcon>
          <ViewBody>
            {haveCard ? (
              <TxtCard>
                ****{' '}
                {methodPayment?.cartNumber?.substring(
                  12,
                  methodPayment?.cartNumber?.length,
                )}{' '}
                • Crédito
              </TxtCard>
            ) : (
              <TxtCard>Escolha a forma de pagamento</TxtCard>
            )}
          </ViewBody>
        </>
      )}
    </>
  );
};

export default FinanceTypePayment;
