import React, { useState, useEffect } from 'react';
import { Modal, Alert } from 'react-native';
import Toast from 'react-native-tiny-toast';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  Container,
  Header,
  IconGoBack,
  styles,
  HeaderText,
  Body,
} from './Styles';
import { Colors } from '../../styles';

import PaymentType from './components/paymentType';
import PaymentMoney from './components/paymentMoney';
import AddMethodPayment from './components/addCreditCard';
import LocalCreditCard from './components/localCreditCard';
import RegisteredCards from './components/registeredCards';

import { listTypePaymentsCompanyDelivery } from '../../services/service/finance';

const PaymentMethods = ({ navigation, route }) => {
  const [loadAdd, setLoadMethod] = useState(false);
  const [newRegister, setNewRegister] = useState(() => {
    return route.params?.newRegister ?? false;
  });
  const [typePayments, setTypePayments] = useState(null);
  const [redirectPayment, setRedirectPayment] = useState(() => {
    return route.params?.redirectPayment ?? false;
  });
  const [modalPaymentMoney, setModalPaymentMoney] = useState(false);
  const [modalLocalCreditCard, setModalLocalCreditCard] = useState(false);
  const [total, setTotal] = useState(() => {
    return route.params?.total;
  });

  const companyId = route.params?.company?.companyDelivery?._id ?? null;

  const confirmRide = route.params?.confirmRide;
  const payload = route.params?.payload;

  console.log('confirmRide', confirmRide);

  const goBack = (item = {}) => {
    if (confirmRide) {
      let params = { ...item, ...payload };
      return navigation.navigate('RideAndTravelStack', {
        screen: 'ConfirmRide',
        params,
      });
    }

    if (redirectPayment) {
      navigation.navigate('Shopping', {
        screen: 'DetailPayment',
        params: {
          typePayment: 'FINANCE',
        },
      });

      return;
    }

    if (navigation.goBack() === false) {
      navigation.navigate('Home', { screen: 'Home' });
    }
  };

  const closeAddPayment = () => {
    setLoadMethod(false);

    if (confirmRide) {
      let params = { ...payload };
      return navigation.navigate('RideAndTravelStack', {
        screen: 'ConfirmRide',
        params,
      });
    }

    if (redirectPayment) {
      navigation.navigate('Shopping', {
        screen: 'DetailPayment',
      });

      return;
    }
  };

  const toastShow = msg => {
    Toast.show(msg, {
      position: Toast.position.TOP,
      containerStyle: {
        marginHorizontal: 20,
        backgroundColor: Colors.PRIMARY,
        borderRadius: 15,
      },
      textStyle: { color: Colors.WHITE },
      mask: false,
      maskStyle: {},
      duration: 4000,
      animation: true,
    });
  };

  const confirmModalPaymentMoney = () => {
    Alert.alert(
      'Pagamento em dinheiro',
      'Vai precisar de troco?',
      [
        {
          text: 'Sim',
          onPress: () => setModalPaymentMoney(true),
        },
        {
          text: 'Não',
          onPress: () =>
            navigation.navigate('Shopping', {
              screen: 'DetailPayment',
              params: {
                typePayment: 'MONEY',
                changeMoney: 0,
              },
            }),
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  useEffect(() => {
    if (!companyId) {
      return;
    }

    const getTypesPayment = async () => {
      const resutlTypePayments = await listTypePaymentsCompanyDelivery(
        companyId,
      );

      if (resutlTypePayments) {
        setTypePayments(resutlTypePayments);
      }
    };

    getTypesPayment();
  }, [companyId]);

  const confirmPix = async () => {
    // const {user} = await isAuthenticated();
    // user?.person?.cpf;
    // console.log('cpf', user?.person?.cpf);

    // setModalPix(true);
    return navigation.navigate('Shopping', {
      screen: 'DetailPayment',
      params: {
        typePayment: 'PIX',
        cpf: null,
      },
    });
  };

  const confirmPixDirect = async () => {
    return navigation.navigate('Shopping', {
      screen: 'DetailPayment',
      params: {
        typePayment: 'PIX_DIRECT',
        cpf: null,
      },
    });
  };

  const moneySelect = () => {
    return goBack({
      payment: {
        type: 'money',
      },
    });
  };

  return (
    <Container>
      <Modal
        animationType="slide"
        transparent={true}
        visible={loadAdd}
        onRequestClose={() => setLoadMethod(false)}>
        <AddMethodPayment close={closeAddPayment} />
      </Modal>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalPaymentMoney}
        onRequestClose={() => setModalPaymentMoney(false)}>
        <PaymentMoney
          close={setModalPaymentMoney}
          navigation={navigation}
          total={total}
        />
      </Modal>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalLocalCreditCard}
        onRequestClose={() => setModalLocalCreditCard(false)}>
        <LocalCreditCard
          close={setModalLocalCreditCard}
          typePayment={typePayments?.CARD}
          navigation={navigation}
        />
      </Modal>
      <Header>
        <IconGoBack onPress={() => goBack()}>
          <Icon name="navigate-before" size={45} style={styles.icon} />
        </IconGoBack>
        <HeaderText>FORMA DE PAGAMENTO</HeaderText>
      </Header>
      <Body showsVerticalScrollIndicator={false}>
        {newRegister &&
          toastShow(
            'Para continuar sua compra selecione um método de pagamento',
          )}
        <PaymentType
          typePayments={typePayments}
          setLoadMethod={setLoadMethod}
          setModalPaymentMoney={confirmModalPaymentMoney}
          setModalLocalCreditCard={setModalLocalCreditCard}
          setPix={confirmPix}
          setPixDirect={confirmPixDirect}
          confirmRide={confirmRide}
          moneySelect={moneySelect}
        />
        <RegisteredCards loadAdd={loadAdd} goBack={goBack} />
      </Body>
    </Container>
  );
};

export default PaymentMethods;
