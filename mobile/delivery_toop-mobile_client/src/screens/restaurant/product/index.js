/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import moment from 'moment-timezone';
import {Modal} from 'react-native';
import {connect} from 'react-redux';

import {toastShow} from '../../../utils';
import {getToCart} from '../../../store/actions/cart';
import {isAuthenticated} from '../../../services/userAuth';
import {listProductGroupCategory} from '../../../services/service/Food';
import {
  StorageSet,
  StorageGet,
  StorageClean,
} from '../../../services/deviceStorage';
import {Container, BoxBtnCart, ViewLootie, LootieContainer} from './Styles';
import {distanceLatLonInKm} from '../../../services/maps/distanceCoordinate';
import {seacrhDeliveryAddress} from '../../../services/service/delivery/address';
import {listOne as companyOne} from '../../../services/service/company';

import Cart from '../cart';
import Header from './components/header';
import ProductList from './components/productList';
import BtnCart from '../../../components/product/btnCart';
import CompanyInformation from './components/companyInformation';
import loaderLootie from '../../../assets/animations/loader.json';
import ValidationLocation from '../../../components/validationLocation';
import LocationCurrent from '../../../services/location/locationCurrent';

const Product = ({
  navigation,
  route,
  onGetToCart,
  qtdProd,
  price,
  loading,
  messageError,
}) => {
  const [minPrice, setMinPrice] = useState(0);
  const [modalCart, setModalCart] = useState(false);
  const [modalValidation, setModalValidation] = useState(false);
  const [coupon, setcoupon] = useState(() => route.params?.coupon ?? null);
  const [company, setCompany] = useState(() => route.params?.company ?? null);
  const [buyAgain] = useState(() => route.params?.buyAgain ?? false);
  const [products, setProducts] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    const onShow = async () => {
      setLoadingProducts(true);
      if (company !== null) {
        let companyResp = await getCompanyDelivery(company);
        setCompany(companyResp);

        if (
          companyResp.companyDelivery &&
          companyResp.companyDelivery.min_purchase &&
          companyResp.companyDelivery.min_purchase > 0
        ) {
          setMinPrice(companyResp.companyDelivery.min_purchase);
        }

        StorageSet('company', companyResp);
        onGetToCart(companyResp._id);
        const result = await listProductGroupCategory({
          company: companyResp._id,
          timezone: moment.tz.guess(),
        });

        setProducts(result);
      }

      setLoadingProducts(false);
    };

    onShow();
  }, [route.params?.company]);

  useEffect(() => {
    if (buyAgain === true && company?.shoppingFlow && qtdProd > 0) {
      setModalCart(true);
    }
  }, [company, buyAgain, qtdProd]);

  useEffect(() => {
    if (price > 0 && coupon) {
      if (
        coupon?.minPriceDelivery &&
        coupon?.minPriceDelivery > 0 &&
        price < coupon?.minPriceDelivery
      ) {
        setcoupon(null);
      }
    }
  }, [price, coupon]);

  const getCompanyDelivery = async company => {
    try {
      if (!company.deliveryPrice || !company.companyDelivery) {
        let respAddress = await StorageGet('@addressUser');
        if (
          respAddress &&
          respAddress.location &&
          respAddress.location.coordinates
        ) {
          let companyResp = await companyOne(company._id, {
            delivery: true,
            latitude: respAddress.location.coordinates[1],
            longitude: respAddress.location.coordinates[0],
          });
          return companyResp;
        }
      }

      return company;
    } catch (err) {
      return company;
    }
  };

  const closeModal = () => {
    setModalCart(false);
  };

  const getCoordinates = async () => {
    const result = await LocationCurrent().getLocation();
    if (result) {
      return result;
    }

    return null;
  };

  const validateCoordinates = async () => {
    const dateValidate = await StorageGet('DateValidadeLocation');

    if (!dateValidate) {
      const dataCurrent = moment().utc(false);
      await StorageSet('DateValidadeLocation', dataCurrent.format());
    } else {
      await StorageSet('DateValidadeLocation', moment().utc(false).format());

      const dateInit = moment(dateValidate).utc(false);
      const dateFinish = moment().utc(false);

      const duration = moment.duration(dateFinish.diff(dateInit));
      const hours = duration.asHours();

      if (hours <= 1) {
        return true;
      }
    }

    const coordinatesLocal = await getCoordinates();

    if (coordinatesLocal) {
      const response = await isAuthenticated();
      const addressUser = await seacrhDeliveryAddress({
        customer: response.user._id,
        main: true,
      });

      if (!addressUser || addressUser.length === 0) {
        navigation.navigate('Customer', {
          screen: 'CustomerAddress',
        });
      }

      const distKm = distanceLatLonInKm(coordinatesLocal, {
        latitude: addressUser[0].location.coordinates[0],
        longitude: addressUser[0].location.coordinates[1],
      });

      if (distKm && distKm !== '') {
        let number = distKm.toFixed(2);
        if (number > 1 || (distKm * 1000).toFixed(0) > 100) {
          return false;
        }
      }
    }

    return true;
  };

  const cartScreen = async () => {
    if (qtdProd > 0) {
      const result = await validateCoordinates();
      if (result) {
        setModalCart(true);
      } else {
        setModalValidation(true);
      }
    } else {
      toastShow('O seu carrinho está vazio', 'ALERT');
    }
  };

  useEffect(() => {
    if (messageError && messageError.message) {
      toastShow(messageError.message, 'ALERT');
    }
  }, [messageError]);

  return (
    <Container>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalCart}
        onRequestClose={() => setModalCart(false)}>
        <Cart close={closeModal} navigation={navigation} coupon={coupon} />
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalValidation}
        onRequestClose={() => setModalValidation(false)}>
        <ValidationLocation
          statusModal={setModalValidation}
          navigation={navigation}
        />
      </Modal>
      <Header navigation={navigation} company={company} />
      <CompanyInformation company={company} />
      {loadingProducts ? (
        <LootieContainer>
          <ViewLootie
            source={loaderLootie}
            resizeMode="contain"
            loop
            autoPlay
          />
        </LootieContainer>
      ) : products !== null ? (
        <ProductList
          navigation={navigation}
          company={company}
          products={products}
        />
      ) : null}
      <BoxBtnCart>
        {qtdProd >= 0 ? (
          <BtnCart
            onPress={cartScreen}
            qtd={qtdProd}
            price={price}
            loading={loading}
            remainingPrice={minPrice > 0 ? minPrice - price : 0}
          />
        ) : null}
      </BoxBtnCart>
    </Container>
  );
};

const mapStateToProps = ({cart}) => {
  let cartResult = cart.cart ? cart.cart : [];
  return {
    loading: cart.loading,
    qtdProd: cartResult.length,
    price: cart.subTotal,
    messageError: cart?.messageError ?? null,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onGetToCart: company =>
      dispatch(
        getToCart(company, {
          type: 'restaurant',
          delivery: true,
        }),
      ),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Product);
