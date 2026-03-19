import React, {useState, useEffect, useCallback} from 'react';

import LootieView from 'lottie-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

/** Service */
import {isAuthenticated} from '../../../../services/userAuth';
import {StorageSet} from '../../../../services/deviceStorage';
import {listFilter} from '../../../../services/service/Filter';
import {listCompany} from '../../../../services/service/company';
import {listOneGuest} from '../../../../services/service/customer';
import {searchCupounsCompany} from '../../../../services/service/coupon';
import {seacrhDeliveryAddress} from '../../../../services/service/delivery/address';
import {listAlertProduct} from '../../../../services/service/customer/alertProduct';

import {Container, ViewLoading, TextNotFound} from './Styles';
import loaderLootie from '../../../../assets/animations/loader.json';

import Companies from './components/Companies';
import FilterList from './components/FilterList';

const Companys = refreshing => {
  const route = useRoute();
  const navigation = useNavigation();

  const [companies, setCompanies] = useState(null);
  const [dataFilter, setDataFilter] = useState([]);
  const [notResult, setNotResult] = useState(false);
  const [guestAddress, setGuestAddres] = useState(null);
  const [customerAddress, setCustomerAddres] = useState(null);
  const [category, setCategory] = useState(route.params?.category ?? null);

  const address = useCallback(async () => {
    const {user: userAuth, guest: guest} = await isAuthenticated();
    if (guest && guest === true) {
      let guestAuth = await listOneGuest(userAuth.device);
      setGuestAddres(guestAuth);
      return guestAuth;
    } else {
      const addressMain = await seacrhDeliveryAddress({
        customer: userAuth._id,
        main: true,
      });

      if (!addressMain || addressMain.length <= 0) {
        navigation.navigate('Customer', {
          screen: 'CustomerAddress',
        });
        return false;
      }

      setCustomerAddres(addressMain[0]);
      return addressMain[0];
    }
  }, [navigation]);

  const companyRequest = useCallback(
    async addressUser => {
      let result;
      const location = addressUser.location.coordinates;

      if (category) {
        result = await listCompany({
          type: 'supermarket',
          delivery: true,
          latitude: location[1],
          longitude: location[0],
          category,
          limit: 6,
          page: 1,
          showAll: true,
        });
      } else {
        result = await listCompany({
          type: 'supermarket',
          delivery: true,
          latitude: location[1],
          longitude: location[0],
          limit: 6,
          page: 1,
          showAll: true,
        });
      }

      if (result !== null && result.length > 0) {
        const getCouponCompany = await searchCupounsCompany();
        await result.map(async (company, index) => {
          const responseCoupon = await getCouponCompany.find(
            getCoupon => getCoupon.company[0]._id === company._id,
          );
          if (responseCoupon) {
            result[index].cupom = responseCoupon.coupon;
          }
        });
        setCompanies(result);
        setNotResult(false);
      } else {
        setCompanies([]);
        setNotResult(true);
      }
    },
    [category],
  );

  const getFilterCompany = async () => {
    let filter = await listFilter({
      type: 'supermarket',
    });

    if (filter) {
      setDataFilter(filter);
    }
  };

  const loadScreen = useCallback(async () => {
    const addressUser = await address();

    // lista de alert de produtos
    await customerAlertProduct();

    if (addressUser !== false) {
      companyRequest(addressUser);
    }
  }, [address, companyRequest]);

  useEffect(() => {
    getFilterCompany();
    loadScreen();
  }, [loadScreen, refreshing]);

  const customerAlertProduct = async () => {
    const {user: userAuth} = await isAuthenticated();
    if (!userAuth._id) {
      return;
    }

    const respAlertProduct = await listAlertProduct({
      customer: userAuth._id,
    });

    if (respAlertProduct) {
      await StorageSet('@customer_alert_product', respAlertProduct);
    }
  };

  return (
    <>
      <FilterList
        data={dataFilter}
        category={category}
        setCategory={setCategory}
      />
      <Companies
        notResult={notResult}
        companies={companies}
        navigation={navigation}
        guestAddress={guestAddress}
        customerAddress={customerAddress}
      />
      {!companies && (
        <ViewLoading>
          <LootieView
            source={loaderLootie}
            style={{height: 120}}
            resizeMode="contain"
            loop
            autoPlay
          />
        </ViewLoading>
      )}
      {notResult && (
        <Container>
          <TextNotFound>Ops nenhum resultado encontrado!!</TextNotFound>
        </Container>
      )}
    </>
  );
};

export default Companys;
