/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback } from 'react';
import { Modal } from 'react-native';

import { connect } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

import { Container, ScrollView } from './Styles';

/** Components */
import Tip from './components/tip';
import Total from './components/total';
import Header from './components/header';
import Totals from './components/totals';
import Address from './components/address';
import Scheduling from './components/scheduling';
import TypePayment from './components/typePayment';
import ModalDetail from './components/modalDetail';
import CashBack from './components/cashback';
import StatusPaymentDetail from './components/statusPaymentDetail';
import PixQrCode from './components/pixQrCode';

/** Service */
import { getToCart } from '../../store/actions/cart';
import { createLog } from '../../services/service/Log';
import { StorageGet } from '../../services/deviceStorage';
import { isAuthenticated } from '../../services/userAuth';
import { listCart } from '../../services/service/shopping/cart';
import { updateCart } from '../../services/service/shopping/cart';
import { seacrhDeliveryAddress } from '../../services/service/delivery/address';
import { listFranchiseConfig } from '../../services/service/company/list';

/** Util */
import config from '../../config';
import isPixActive from '../../utils/screens/isPixActive';

const DetailPayment = ({
  navigation,
  onGetToCart,
  total,
  route,
  cartUser,
  paymentsAccepted,
  serviceCharge,
  deliveryFee,
  minPriceDeliveryFree,
  subTotal,
  cashbackBalance,
  availableCashback,
}) => {
  const [cart, setCart] = useState(null);
  const [status, setStatus] = useState(1);
  const [attemps, setAttemps] = useState(0);
  const [params, setParams] = useState(true);
  const [company, setCompany] = useState(null);
  const [totalCart, setTotalCart] = useState(0);
  const [delivery, setDelivery] = useState(null);
  const [tipSelected, setTipSelected] = useState(0);
  const [modalStatus, setModalStatus] = useState(false);
  const [modalPIX, setModalPIX] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [fingerPrintId] = useState('-');
  const [modalValidate, setModalValidate] = useState(true);
  const [deliveryFree, setDeliveryFree] = useState(false);
  const [haveCard, setHaveCard] = useState(false);
  const [configuration, setConfiguration] = useState(false);
  const [useCashbackBalance, setUseCashbackBalance] = useState(0);

  const card = route?.params?.card || null;
  const typeCard = route?.params?.typeCard || '';
  const coupon = route?.params?.coupon?._id || null;
  const changeMoney = route?.params?.changeMoney || 0;
  const couponDiscount = route?.params?.coupon || null;
  const typePayment = route?.params?.typePayment || 'FINANCE';
  const typeSchedule = route?.params?.typeSchedule || 'DELIVERY';
  const isSchedule = route?.params?.isSchedule;

  const [barCode, setBarCode] = useState(null);
  const [qrcode, setQrcode] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const loadInfo = async () => {
        let companyParam = await StorageGet('company');
        setCompany(companyParam);
        const { user: userAuth } = await isAuthenticated();

        await getCart(companyParam, userAuth);
        await getDeliveryList(userAuth);

        onGetToCart(companyParam);

        if (!typeSchedule || typeSchedule === 'DELIVERY') {
          setTotalCart(total + deliveryFee);
        } else {
          setTotalCart(total);
        }

        if (companyParam && companyParam._id) {
          listFranchiseConfig(companyParam._id).then(result => {
            // console.log('configurações atuais', result);
            if (result) {
              setConfiguration(result);
            }
          });
        }
      };

      setAttemps(0);
      let pageRedirect = route.params?.pageRedirect ?? null;

      setParams(pageRedirect);
      loadInfo();

      return function cleanup() {
        setModalValidate(false);
        setModalStatus(false);
      };
    }, [
      deliveryFee,
      onGetToCart,
      route.params.pageRedirect,
      total,
      typeSchedule,
    ]),
  );

  // Frete Grátis
  useFocusEffect(
    useCallback(() => {
      if (
        (!typeSchedule || typeSchedule === 'DELIVERY') &&
        minPriceDeliveryFree > 0 &&
        subTotal > minPriceDeliveryFree
      ) {
        return setDeliveryFree(true);
      } else if (typeSchedule && typeSchedule === 'WITHDRAWAL') {
        // Retirada no local Frete Grátis
        return setDeliveryFree(true);
      }

      setDeliveryFree(false);
    }, [typeSchedule, subTotal, minPriceDeliveryFree]),
  );

  const getDeliveryList = async userAuth => {
    const resultList = await seacrhDeliveryAddress({
      customer: userAuth._id,
      main: true,
    });

    if (resultList && resultList[0]) {
      setDelivery(resultList[0]);
    }

    setModalValidate(false);
  };

  const getCart = async (companyParam, userAuth) => {
    const cartResult = await listCart(userAuth._id, companyParam._id);
    if (cartResult && cartResult.length) {
      setCart(cartResult[0]);

      // pix current
      let response = await isPixActive(cartResult[0] || 0);

      if (response) {
        showPixModal(response);
      }
    }
  };

  const showPixModal = async pixItem => {
    console.log('pixItem', pixItem);
    if (pixItem && pixItem?.qrcode) {
      setQrcode(pixItem?.qrcode);
      setBarCode(`${pixItem?.qrcode_text}`);
      setModalPIX(true);
    }
  };

  return (
    <Container>
      <Header
        navigation={navigation}
        params={params}
        company={company}
        coupon={coupon}
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalValidate}
          onRequestClose={() => setModalValidate(false)}>
          <ModalDetail />
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalStatus}
          onRequestClose={() => setModalStatus(false)}>
          <StatusPaymentDetail
            status={status}
            statusMessage={statusMessage}
            navigation={navigation}
            setModalStatus={setModalStatus}
            typePayment={typePayment}
          />
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalPIX}
          onRequestClose={() => setModalPIX(false)}>
          <PixQrCode
            navigation={navigation}
            modal={setModalPIX}
            cart={cart}
            barCode={barCode}
            qrcode={qrcode}
          />
        </Modal>

        <Address delivery={delivery} navigation={navigation} />
        {isSchedule !== false ? (
          <Scheduling
            navigation={navigation}
            company={company}
            schedule={cart?.schedule}
            typeSchedule={typeSchedule}
          />
        ) : null}
        <TypePayment
          card={card}
          typeCard={typeCard}
          paymentType={typePayment}
          changeMoney={changeMoney}
          navigation={navigation}
          company={company}
          haveCard={haveCard}
          setHaveCard={setHaveCard}
          total={totalCart + tipSelected}
          availableCashback={availableCashback}
          paymentsAccepted={paymentsAccepted}
        />
        {configuration && configuration?.activateTip === true ? (
          <Tip
            tipSelected={tipSelected}
            setTipSelected={setTipSelected}
            navigation={navigation}
            tipValue={route?.params.tipValue}
          />
        ) : null}

        {cashbackBalance && cashbackBalance > 0 ? (
          <CashBack
            cashbackBalance={cashbackBalance}
            useCashbackBalance={useCashbackBalance}
            setUseCashbackBalance={setUseCashbackBalance}
          />
        ) : null}

        <Totals
          cart={cartUser}
          tip={tipSelected}
          subTotal={subTotal}
          coupon={couponDiscount}
          deliveryFee={deliveryFee}
          companyDelivery={company?.companyDelivery}
          typeSchedule={typeSchedule}
          serviceCharge={serviceCharge}
          useCashbackBalance={useCashbackBalance}
          minPriceDeliveryFree={minPriceDeliveryFree}
        />
      </ScrollView>
      <Total
        subTotal={subTotal}
        typeSchedule={typeSchedule}
        total={totalCart + tipSelected}
        company={company}
        coupon={couponDiscount}
        deliveryFee={deliveryFee}
        setStatus={setStatus}
        setStatusMessage={setStatusMessage}
        setModalStatus={setModalStatus}
        cart={cart}
        typePayment={typePayment}
        tipSelected={tipSelected}
        fingerPrintId={fingerPrintId}
        card={card}
        changeMoney={changeMoney}
        navigation={navigation}
        address={delivery?.address}
        deliveryFree={deliveryFree}
        haveCard={haveCard}
        setHaveCard={setHaveCard}
        showPixModal={showPixModal}
        useCashbackBalance={useCashbackBalance}
        companyDelivery={company?.companyDelivery}
        setUseCashbackBalance={setUseCashbackBalance}
      />
    </Container>
  );
};

const mapStateToProps = ({ cart }) => {
  let total = cart.subTotal + cart.serviceCharge;
  let cartResult = cart.cart ? cart.cart : [];

  // Sum amount itens cart
  let sumItens;
  if (cartResult.length) {
    sumItens = cartResult
      .map(item => item.amount)
      .reduce((prev, next) => prev + next);
  }

  return {
    total: total,
    subTotal: cart.subTotal,
    cartUser: cart.cart,
    paymentsAccepted: cart?.company?.companyDelivery?.typePayments || [],
    serviceCharge: cart.serviceCharge,
    deliveryFee: cart.deliveryFee,
    minPriceDeliveryFree: cart.minPriceDeliveryFree,
    cashbackBalance: cart.cashbackBalance,
    availableCashback: cart.availableCashback,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onGetToCart: company =>
      dispatch(
        getToCart(company._id, {
          delivery: 'true',
          type: company?.shoppingFlow === 'MENU' ? 'restaurant' : 'supermarket',
        }),
      ),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DetailPayment);
