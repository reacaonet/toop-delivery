import React, {useState, useCallback} from 'react';

import {connect} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/dist/MaterialIcons';

import {
  styles,
  Container,
  SafeAreaView,
  ScrollView,
  Modal,
  StatusBar,
  ViewHeader,
  TextHeader,
  TouchableOpacity,
} from './Styles';

import {StorageGet} from '../../../services/deviceStorage';
import {isAuthenticated} from '../../../services/userAuth';
import {listCompanyCouponsAvailable} from '../../../services/service/coupon/list';

import {getToCart, cleanToCart} from '../../../store/actions/cart';

import Coupon from './components/Coupon';
import Totals from './components/Totals';
import CleanCartModal from './cleanCartModal';
import ItensCart from './components/ItensCart';
import BtnContine from './components/BtnContine';
import ItensCartHeader from './components/ItensCartHeader';
import ModalOutsideCoverageArea from './components/ModalOutsideCoverageArea';

const Cart = ({
  close,
  navigation,
  cartUser,
  subTotal,
  deliveryFee,
  minPriceDeliveryFree,
  serviceCharge,
  onGetToCart,
  onCleanCart,
  total,
  coupon,
  shippingInfo,
}) => {
  const [coupons, setCoupons] = useState([]);
  const [company, setCompany] = useState(null);
  const [modalClean, setModalClean] = useState(false);
  const [withdrawOnSite, setWithdrawOnSite] = useState(false);
  const [modalOutsideCoverageArea, setModalOutsideCoverageArea] = useState(
    false,
  );

  useFocusEffect(
    useCallback(() => {
      // if (cartUser.length <= 0) {
      //   close();
      //   return;
      // }

      const getCouponQuantity = async companyId => {
        let respAddress = await StorageGet('@addressUser');
        if (!respAddress?.location || !respAddress.location?.coordinates) {
          return;
        }

        const params = {
          latitude: respAddress.location.coordinates[1],
          longitude: respAddress.location.coordinates[0],
        };

        const {user: userAuth} = await isAuthenticated();
        const resp = await listCompanyCouponsAvailable(
          companyId,
          subTotal,
          userAuth.person?._id,
          params,
        );

        setCoupons(resp.coupons);
      };

      const runCompany = async () => {
        const companyStorage = await StorageGet('company');
        if (companyStorage) {
          setCompany(companyStorage);
          onGetToCart(companyStorage._id);
          getCouponQuantity(companyStorage._id);
        }
      };

      runCompany();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <Container>
      <SafeAreaView>
        <StatusBar barStyle="dark-content" />
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalClean}
          onRequestClose={() => setModalClean(false)}>
          <CleanCartModal
            close={close}
            back={setModalClean}
            confirm={onCleanCart}
          />
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalOutsideCoverageArea}
          onRequestClose={() => setModalOutsideCoverageArea(false)}>
          <ModalOutsideCoverageArea
            close={close}
            withdrawOnSite={withdrawOnSite}
            statusModal={setModalOutsideCoverageArea}
          />
        </Modal>
        <ViewHeader>
          <TouchableOpacity onPress={() => close()}>
            <Icon name="navigate-before" size={45} style={styles.icon} />
          </TouchableOpacity>
          <TextHeader>CARRINHO</TextHeader>
        </ViewHeader>
        <ItensCartHeader />
        <ScrollView showsVerticalScrollIndicator={false}>
          <ItensCart itens={cartUser} close={close} company={company} />
          {coupons && coupons.length > 0 && (
            <Coupon
              coupons={coupons}
              company={company}
              subTotal={subTotal}
              navigation={navigation}
            />
          )}

          <Totals
            cart={cartUser}
            coupon={coupon}
            subTotal={subTotal}
            serviceCharge={serviceCharge}
            deliveryPrice={deliveryFee}
            minPriceDeliveryFree={minPriceDeliveryFree}
            shippingInfo={shippingInfo}
          />
        </ScrollView>
        <BtnContine
          close={close}
          total={total}
          shippingInfo={shippingInfo}
          subTotal={subTotal}
          deliveryPrice={deliveryFee}
          coupon={coupon}
          cart={cartUser}
          company={company}
          navigation={navigation}
          setModalClean={setModalClean}
          setWithdrawOnSite={setWithdrawOnSite}
          setModalOutsideCoverageArea={setModalOutsideCoverageArea}
        />
      </SafeAreaView>
    </Container>
  );
};

const mapStateToProps = ({cart}) => {
  let total = cart.subTotal;

  if (cart.serviceCharge) {
    total += cart.serviceCharge;
  }

  if (cart.deliveryFee && cart.subTotal > cart.minPriceDeliveryFree) {
    total += cart.deliveryFee;
  }

  return {
    cartUser: cart.cart,
    subTotal: cart.subTotal,
    serviceCharge: cart.serviceCharge,
    deliveryFee: cart.deliveryFee,
    minPriceDeliveryFree: cart.minPriceDeliveryFree,
    total: total,
    shippingInfo: cart.shippingInfo,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onGetToCart: company => dispatch(getToCart(company, {delivery: 'true'})),
    onCleanCart: () => dispatch(cleanToCart()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Cart);
