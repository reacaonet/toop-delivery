/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useCallback} from 'react';
import {View, ScrollView} from 'react-native';
import {connect, useSelector, useDispatch} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {isAuthenticated} from '../../services/userAuth';
import {StorageGet, StorageSet} from '../../services/deviceStorage';
import {getAddress} from '../../store/actions/user';

import {getCurrentPosition} from '../../store/actions/location';
// import {ServiceButton} from './components/ServiceButton';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {ContainerModal, TitleHeader, Head} from './styles';

/** Components */
import Popup from './components/Popup';
import Tabs from './components/Tabs';
import RestaurantCategory from './components/RestaurantCategory';
// import Rating from './components/Rating';
// import Banner from './components/Banner';
import Companys from './components/Companys';
import SliderComponent from './components/Slide';
import Highlights from './components/Companys/ShowCases/Highlights';
import Categories from './components/Categories';
import ActiveOrders from './components/ActiveOrders';
import BottomNavigation from './components/BottomNavigation';

import {
  Container,
  ContainerView,
  ContainerDrive,
  ButtonTest,
  MapContainer,
  MenuButton,
  ButtonBoard,
  TextButton,
  ImageIcon,
  ButtonImage,
  Header,
} from './Styles/index';

/** Util */
import isPixActive from '../../utils/screens/isPixActive';

const Home = ({onAddress}) => {
  const category = useSelector(state => state.tab?.category);
  const [enableRating, setEnableRatin] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    const getUser = async () => {
      const {user: userAuth} = await isAuthenticated();

      if (userAuth.rating) {
        setEnableRatin(false);
        return;
      }

      const quantity = await StorageGet('OPENAPP');

      if (quantity && parseInt(quantity, 0) >= 10) {
        await StorageSet('OPENAPP', '1');
        setEnableRatin(true);
      }
    };

    getUser();
    onAddress();

    return () => {
      //
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const verifyPixActive = async () => {
        let response = await isPixActive();

        if (response) {
          if (response.company) {
            await StorageSet('company', response.company);
          }

          return navigation.navigate('Shopping', {
            screen: 'DetailPayment',
            params: {
              tipValue: response?.tipValue || 0,
              typePayment: 'PIX',
              cpf: null,
            },
          });
        }
      };
      verifyPixActive();
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      dispatch(getCurrentPosition());
    }, []),
  );

  let myScroll = React.createRef();

  const goInitialPositionList = () => {
    myScroll.scrollTo({animated: false, x: 0, y: 0});
  };

  return (
    <View style={{flex: 1}}>
      <Popup />
      <Container>
        <Tabs />
        <ScrollView
          showsVerticalScrollIndicator={false}
          horizontal={false}
          ref={ref => {
            myScroll = ref;
          }}>
          {category === 'delivery' || category === 'service' ? (
            <RestaurantCategory companyCategory={category} />
          ) : null}

          {category === 'drive' ? navigation.navigate('Drive') : null}

          <ContainerView>
            <SliderComponent category={category} />
            <Highlights category={category} />
            <Categories category={category} />
            <ActiveOrders />
            {/* <Banner /> */}
            <Companys category={category} />
          </ContainerView>
        </ScrollView>
      </Container>
      <BottomNavigation goInitialPositionList={goInitialPositionList} />
    </View>
  );
};

const mapDispatchToProps = dispatch => {
  return {
    onAddress: () => dispatch(getAddress()),
  };
};

export default connect(null, mapDispatchToProps)(Home);
