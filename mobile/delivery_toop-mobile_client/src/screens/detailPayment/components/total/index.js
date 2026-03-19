import React, { useState } from 'react';
import publicIp from 'public-ip';
import { Alert } from 'react-native';
import moment from 'moment';
import { useSelector } from 'react-redux';

import {
  Container,
  ViewTotal,
  Text,
  TouchSendOrder,
  ViewButton,
  TextButton,
  ActivityIndicator,
} from './Styles';

import { formatMoney } from '../../../../utils';
import isPixActive from '../../../../utils/screens/isPixActive';

/** Service */
import {
  sendPayment,
  sendPaymentCard,
  sendPaymentMoney,
  sendPaymentPixDirect,
  errSendPayment,
  errPayload,
} from '../../../../services/service/shopping/payment';
import { isAuthenticated } from '../../../../services/userAuth';
import { generatePIX } from '../../../../services/service/pix/generate';
import { StorageSet } from '../../../../services/deviceStorage';

const Total = ({
  total,
  company,
  coupon,
  setStatus,
  setStatusMessage,
  setModalStatus,
  cart,
  typePayment,
  tipSelected,
  fingerPrintId,
  card,
  changeMoney,
  navigation,
  address,
  typeSchedule,
  deliveryFree,
  haveCard,
  showPixModal,
  useCashbackBalance,
  setUseCashbackBalance,
  companyDelivery,
  subTotal,
  deliveryFee,
}) => {
  const { configurations = null } = useSelector(state => state);
  const [loader, setLoader] = useState(false);
  const [disabledFinishedButton, setDisabledFinishedButton] = useState(false);

  const finalPrice = () => {
    try {
      let finalTotal = total - getFreeShippingBonus();

      if (coupon && coupon.price && coupon.price > 0) {
        finalTotal -= coupon.price;
      }

      if (useCashbackBalance && useCashbackBalance > 0) {
        if (finalTotal < useCashbackBalance) {
          setUseCashbackBalance(finalTotal);
        } else {
          finalTotal -= useCashbackBalance;
        }
      }

      return formatMoney(finalTotal, configurations?.coin);
    } catch (err) {
      console.log(err);
      return formatMoney(total, configurations?.coin);
    }
  };

  const getFreeShippingBonus = () => {
    let free = 0; // bonificacao do frete
    if (companyDelivery?.shippingInfo?.freeShipping) {
      if (
        companyDelivery?.shippingInfo?.freeShippingAbove === null ||
        companyDelivery?.shippingInfo?.freeShippingAbove === 0
      ) {
        free = deliveryFee;
      } else if (subTotal > companyDelivery?.shippingInfo?.freeShippingAbove) {
        free = deliveryFee;
      }
    }

    return free;
  };

  const payOrder = async () => {
    setStatus(1);
    setStatusMessage('Estamos criando seu pedido...');
    setModalStatus(true);
    setDisabledFinishedButton(true);

    if (typePayment === 'FINANCE') {
      if (!haveCard) {
        setDisabledFinishedButton(false);
        setModalStatus(false);
        navigation.navigate('PaymentMethods', {
          redirectPayment: true,
          newRegister: false,
          company,
          total,
        });
        return;
      }
    }

    const { user } = await isAuthenticated();

    const ip = await publicIp.v4({
      fallbackUrls: ['https://ifconfig.co/ip'],
    });

    if (cart) {
      let respPayment;

      if (typePayment && typePayment === 'CARD') {
        respPayment = await sendPaymentCard(cart._id, {
          customer: user._id,
          ipAddress: ip,
          coupon,
          valueTip: tipSelected,
          fingerPrintId,
          typePaymentId: card._id,
          typeSchedule,
          deliveryFree,
          usedCashback: useCashbackBalance,
          freeShippingBonus: getFreeShippingBonus(),
          freeShippingBonusOrigin: companyDelivery?.shippingInfo?.activatedBy,
        });
      } else if (typePayment && typePayment === 'PIX') {
        respPayment = await sendPayment(cart._id, {
          customer: user._id,
          ipAddress: ip,
          coupon,
          valueTip: tipSelected,
          fingerPrintId,
          typeSchedule,
          typePayment,
          deliveryFree,
          usedCashback: useCashbackBalance,
          freeShippingBonus: getFreeShippingBonus(),
          freeShippingBonusOrigin: companyDelivery?.shippingInfo?.activatedBy,
        });

        setDisabledFinishedButton(false);
        setModalStatus(false);
        return generatePixIugu(respPayment);
      } else if (typePayment && typePayment === 'MONEY') {
        respPayment = await sendPaymentMoney(cart._id, {
          customer: user._id,
          ipAddress: ip,
          coupon,
          valueTip: tipSelected,
          fingerPrintId,
          cashChange: changeMoney,
          typeSchedule,
          deliveryFree,
          usedCashback: useCashbackBalance,
          freeShippingBonus: getFreeShippingBonus(),
          freeShippingBonusOrigin: companyDelivery?.shippingInfo?.activatedBy,
        });
      } else if (typePayment && typePayment === 'PIX_DIRECT') {
        respPayment = await sendPaymentPixDirect(cart._id, {
          customer: user._id,
          ipAddress: ip,
          coupon,
          valueTip: tipSelected,
          fingerPrintId,
          typeSchedule,
          deliveryFree,
          usedCashback: useCashbackBalance,
          freeShippingBonus: getFreeShippingBonus(),
          freeShippingBonusOrigin: companyDelivery?.shippingInfo?.activatedBy,
        });
      } else {
        respPayment = await sendPayment(cart._id, {
          customer: user._id,
          ipAddress: ip,
          coupon,
          valueTip: tipSelected,
          fingerPrintId,
          typeSchedule,
          deliveryFree,
          usedCashback: useCashbackBalance,
          freeShippingBonus: getFreeShippingBonus(),
          freeShippingBonusOrigin: companyDelivery?.shippingInfo?.activatedBy,
        });
      }

      if (errSendPayment !== null) {
        if (errPayload && errPayload.status === 'error') {
          setStatus('error');
        } else {
          setStatus(3);
        }

        setStatusMessage(errSendPayment);
        setDisabledFinishedButton(false);
        return;
      }

      if (
        respPayment &&
        respPayment.paymentId &&
        // respPayment.status > 0 &&
        respPayment.status <= 2
      ) {
        setStatus(2);
        setStatusMessage('Pedido Criado');
        setTimeout(() => {
          navigation.navigate('Shopping', {
            screen: 'PaymentStatus',
            params: {
              paymentId: respPayment.paymentId,
            },
          });
          setDisabledFinishedButton(false);
          setModalStatus(false);
        }, 1000);

        return;
      }

      setDisabledFinishedButton(false);

      if (respPayment && respPayment.status) {
        console.log('respPayment.status', respPayment.status);
        console.log('respPayment.statusMessage', respPayment.statusMessage);

        setStatus(respPayment.status);
        setStatusMessage(respPayment.statusMessage);
        return;
      }

      setModalStatus(false);
    } else {
      setDisabledFinishedButton(false);
      setModalStatus(false);
      navigation.navigate('PaymentMethods', {
        redirectPayment: true,
        newRegister: false,
        company,
        total,
      });
    }
  };

  const sendPaymentAndActiveLoader = async () => {
    try {
      setLoader(true);
      await payOrder();
      setLoader(false);
    } catch (err) {
      setLoader(false);
    }
  };

  const disabled = () => {
    let fingerPrint = true;

    if (typePayment === 'FINANCE' && fingerPrintId === null) {
      fingerPrint = false;
    }

    return address && fingerPrint && !disabledFinishedButton ? false : true;
  };

  const generatePixIugu = async response => {
    await StorageSet('@pix-active', {
      time: moment().utc(false).toString(),
      cartId: cart?._id,
      tipValue: tipSelected,
      company: company,
      qrcode: `${response?.qrcode}`.toString(),
      qrcode_text: `${response?.qrcode_text}`.toString(),
    });

    setLoader(false);
    showPixModal(response);
  };

  const generatePix = async () => {
    try {
      // console.log('generate pix ....');
      // await StorageClean('@pix-active');

      setLoader(true);
      let response = await isPixActive(cart);
      let pixResponse = response || false;

      // not pix active
      if (!response) {
        response = await generatePIX({
          cartId: cart._id,
          customerId: cart?.customer?._id || cart?.customer,
          valueTip: tipSelected,
          // cpf: cpf,
          coupon: coupon || undefined,
          typeSchedule: typeSchedule || undefined,
          deliveryFree,
        });
      }

      setLoader(false);

      if (!response || response.errMessage) {
        return Alert.alert(
          'PIX',
          response?.errMessage || 'Não conseguimos gerar o QRcode',
        );
      }

      if (pixResponse === false) {
        await StorageSet('@pix-active', {
          time: moment().utc(false).toString(),
          cartId: cart?._id,
          tipValue: tipSelected,
          company: company,
          qrcode: `${response?.qrcode}`.toString(),
        });
      }

      showPixModal(response);
    } catch (err) {
      console.log('fail generatePix', err);
    }
  };

  return (
    <Container>
      <ViewTotal>
        <Text>TOTAL:</Text>
        <Text>{finalPrice()}</Text>
      </ViewTotal>
      <ViewButton>
        {/* {typePayment !== 'PIX' ? ( */}
        <TouchSendOrder
          enabled={!loader}
          disabled={loader && !disabled()}
          onPress={() => sendPaymentAndActiveLoader()}>
          {disabled() ? (
            <ActivityIndicator size="small" />
          ) : (
            <TextButton enabled={!loader}>
              {loader ? 'Carregando...' : 'Fazer Pedido'}
            </TextButton>
          )}
        </TouchSendOrder>
        {/* ) : (
          <TouchSendOrder
            enabled={!loader}
            disabled={loader && !disabled()}
            onPress={() => generatePix()}>
            {disabled() ? (
              <ActivityIndicator size="small" />
            ) : (
              <TextButton enabled={!loader}>
                {loader ? 'Aguarde ...' : 'Continuar'}
              </TextButton>
            )}
          </TouchSendOrder>
        )} */}
      </ViewButton>
    </Container>
  );
};

export default Total;
