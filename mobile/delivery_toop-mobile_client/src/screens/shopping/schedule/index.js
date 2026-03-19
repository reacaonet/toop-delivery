import React, {useState, useEffect} from 'react';
import {
  Modal,
  StyleSheet,
  Platform,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {Typography, Colors} from '../../../styles';
import {StorageGet} from '../../../services/deviceStorage';

import {
  styles,
  SafeAreaView,
  StatusBar,
  ViewHeader,
  TextHeader,
} from './Styles';

import TypeSchedule from './components/typeSchedule';
import ScheduleList from './components/scheduleList';
import ModalScheduleWithdrawal from './components/modalScheduleWithdrawal';
import {updateCart} from '../../../services/service/shopping/cart';

const Schedule = props => {
  const [modal, setModal] = useState(false);
  const [companyLocal, setCompanyLocal] = useState(null);
  const [showSchedule, setShowSchedule] = useState(() => {
    if (props.route.params.showSchedule === false) {
      return false;
    }
    return true;
  });

  const [typeSchedule, setTypeSchedule] = useState(() => {
    if (props.route.params.outsideCoverageArea) {
      return 'WITHDRAWAL';
    }

    return 'DELIVERY';
  });
  const [outsideCoverageArea, setOutsideCoverageArea] = useState(() => {
    return props.route.params.outsideCoverageArea ?? false;
  });

  const goBack = async () => {
    const company = props.route.params.company ?? null;
    const coupon = props.route.params.coupon ?? null;
    const origin = props.route.params.origin ?? null;

    if (origin && origin.name) {
      return props.navigation.navigate(origin.name, {
        screen: origin.screen,
        params: {
          company,
          coupon,
        },
      });
    }

    return props.navigation.navigate('Supermarket', {
      screen: 'Product',
      params: {
        company,
        coupon,
      },
    });
  };

  const getCompany = async () => {
    const company = await StorageGet('company');
    if (company && company._id) {
      setCompanyLocal(company);
    }
  };

  const navigateToPay = async () => {
    const cart = await StorageGet('cart-atual');
    const cartId = cart && cart._id ? cart._id : undefined;
    const saveScheduleCart = await updateCart(cartId, {schedule: null});

    props.navigation.navigate('DetailPayment', {
      pageRedirect: [
        props?.route?.params?.origin?.name,
        props?.route?.params?.origin?.screen,
      ],
      company: companyLocal,
      payload: null,
      coupon: props?.route?.params?.coupon ?? null,
      typeSchedule,
    });
  };

  useEffect(() => {
    getCompany();
  }, []);

  return (
    <SafeAreaView>
      <StatusBar barStyle="dark-content" />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modal}
        onRequestClose={() => setModal(false)}>
        <ModalScheduleWithdrawal
          back={setModal}
          company={companyLocal}
          setTypeSchedule={setTypeSchedule}
        />
      </Modal>
      <ViewHeader>
        <Icon
          name="navigate-before"
          size={45}
          style={styles.icon}
          onPress={() => goBack()}
        />
        <TextHeader>
          {showSchedule ? 'AGENDA' : 'Delivery ou retirada?'}
        </TextHeader>
      </ViewHeader>
      <TypeSchedule
        company={companyLocal}
        setModal={setModal}
        typeSchedule={typeSchedule}
        setTypeSchedule={setTypeSchedule}
        outsideCoverageArea={outsideCoverageArea}
        deliveryPrice={companyLocal?.deliveryPrice}
        withdrawMarket={companyLocal?.companyDelivery?.withdrawMarket ?? true}
        showSchedule={showSchedule}
      />
      {showSchedule ? (
        <ScheduleList
          company={companyLocal}
          navigation={props.navigation}
          coupon={props.route.params.coupon}
          typeSchedule={typeSchedule}
        />
      ) : (
        <View style={innerStyles.btnContent}>
          <TouchableOpacity
            style={[innerStyles.btnCheckout]}
            onPress={() => {
              navigateToPay();
            }}>
            <Text style={innerStyles.txtCheckout}>Finalizar Compra</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Schedule;

const innerStyles = StyleSheet.create({
  btnContent: {
    padding: 10,
    paddingBottom: 15,
    flex: 1,
    justifyContent: 'flex-end',
  },
  btnCheckout: {
    textAlign: 'center',
    width: '100%',
    padding: 10,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtCheckout: {
    color: Colors.WHITE,
    textAlign: 'center',
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: Typography.FONT_SIZE_15,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});
