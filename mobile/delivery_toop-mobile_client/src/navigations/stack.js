import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {Colors, Typography} from '../styles';
import {
  HeaderBack,
  HomeButton,
  // HeaderMenu,
} from '../components';

import Splash from '../screens/splash';
import Connectivity from '../screens/connectivity';
// RestaurantStack
import Restaurant from '../screens/restaurant';
import RestaurantProduct from '../screens/restaurant/product';
import RestaurantDetails from '../screens/restaurant/details';
import RestaurantProductDetails from '../screens/restaurant/ProductDetails';
import RestaurantPizzaDetails from '../screens/restaurant/PizzaDetails';

// Market
import Product from '../screens/supermarket/product';
import ProductDetails from '../screens/supermarket/ProductDetails';
import Supermarket from '../screens/supermarket';
import SupermarketDetails from '../screens/supermarket/details';
// Settings
import CustomerAddress from '../screens/customer/address';
import CustomerEdit from '../screens/customer/edit';
import Location from '../screens/location';
import Login from '../screens/login';
import NewUser from '../screens/customer/newUser';
// Shopping
import DetailPayment from '../screens/detailPayment';
import Order from '../screens/order';
import Payment from '../screens/payment';
import PaymentMethods from '../screens/paymentMethods';
import PaymentStatus from '../screens/paymentStatus';
import PaymentStatusItems from '../screens/paymentStatus/card/items';
import Schedule from '../screens/shopping/schedule';
import ChatPayment from '../screens/paymentStatus/ChatPayment';
import Coupon from '../screens/coupon';
import CouponRules from '../screens/coupon/couponRules';
import TipOtherValue from '../screens/tipOtherValue';
import CompanySegment from '../screens/companySegment';

// Search
import Search from '../screens/search';

import {HeaderGoBack} from '../components/shared/header';

// Favorite
import Favorite from '../screens/favorites';

// Estabelecimentos Cupom
import CompaniesCoupon from '../screens/companiesCoupon';

// Termos
import Terms from '../screens/terms';
import TermsDescription from '../screens/termsDescription';

//Suporte
import Support from '../screens/support';

const Stack = createStackNavigator();

// Import Stacks
import HomeStack from './Stack/HomeStack';
import PermissionsStack from './Stack/PermissionStack';
import customerAddressMap from '../screens/customer/address/customerAddressMap';

//Cash Back
import cashBack from '../screens/cashBack';
import bankStatement from '../screens/cashBack/bankStatement';

// Driver
import RideAndTravel from '../screens/drive';
import {SelectDestiny} from '../screens/drive/SelectDestiny';
import {SelectRide} from '../screens/drive/SelectRide';
import ConfirmRide from '../screens/drive/ConfirmRide';
import {Ride} from '../screens/drive/Ride';
import RaceAccepted from '../screens/drive/RaceAccepted';
import CancelBooking from '../screens/drive/CancelBooking';
import evaluationScreen from '../screens/drive/evaluationScreen';
import ChangeRoute from '../screens/drive/ChangeRoute';
import History from '../screens/drive/historyRun';
import Detail from '../screens/drive/historyRun/components/plus/detalhes';
import AutoBoard from '../screens/drive/autoBoard';

//MESSAGE
import Messages from '../screens/messages';
import Conversation from '../screens/messages/components/conversation';

//PAGAMENTO
import Pag from '../screens/pag';
import CardPag from '../screens/pag/addCard/index';

//CARTEIRA
import Wallet from '../screens/wallet';
import Cashback from '../screens/wallet/cashback';
import Recommendation from '../screens/wallet/recommendation';

//EMPRESAS
import Companies from '../screens/companies';
import Cob from '../screens/companies/cob';
import RegisteredCards from '../screens/companies/reg';

//INDICAÇÕES
import Send from '../screens/indicate';

//SUPPORTE
import Sup from '../screens/sup';
import Email from '../screens/sup/email/email';
import RunCar from '../screens/sup/email/screenName';

/** Translate */
import i18next from '../locales';

const CustomerStack = ({navigation}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.PRIMARY,
        },
        headerTintColor: Colors.WHITE,
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTitleStyle: {
          fontFamily: Typography.FONT_FAMILY_BOLD,
        },
      }}>
      <Stack.Screen
        name="CustomerAddress"
        component={CustomerAddress}
        options={{
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
      <Stack.Screen
        name="CustomerAddressMap"
        component={customerAddressMap}
        options={{
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
      <Stack.Screen
        name="CustomerEdit"
        component={CustomerEdit}
        options={{
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
    </Stack.Navigator>
  );
};

const LocationStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.PRIMARY,
        },
        headerTintColor: Colors.WHITE,
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTitleStyle: {
          fontFamily: Typography.FONT_FAMILY_BOLD,
        },
      }}>
      <Stack.Screen
        name="Location"
        component={Location}
        options={{title: 'Localização'}}
      />
    </Stack.Navigator>
  );
};

const LoginStack = () => {
  return (
    <Stack.Navigator initialRouteName="Login" headerMode="none">
      <Stack.Screen name="Login" component={Login} options={{title: 'Login'}} />
    </Stack.Navigator>
  );
};

const TermsStack = () => {
  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen
        name="Terms"
        component={Terms}
        options={{title: 'Termos de Uso'}}
      />
    </Stack.Navigator>
  );
};

const TermsDescriptionStack = () => {
  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen
        name="TermsDescription"
        component={TermsDescription}
        options={{title: 'Termos de Uso'}}
      />
    </Stack.Navigator>
  );
};

const NewUserStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: Colors.PRIMARY,
        },
        headerTintColor: Colors.WHITE,
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTitleStyle: {
          fontFamily: Typography.FONT_FAMILY_BOLD,
        },
      }}>
      <Stack.Screen
        name="NewUserScreen"
        component={NewUser}
        options={{title: 'Registro de usuário'}}
      />
    </Stack.Navigator>
  );
};

const RestaurantStack = ({navigation}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.PRIMARY,
        },
        headerTintColor: Colors.WHITE,
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTitleStyle: {
          fontFamily: Typography.FONT_FAMILY_MEDIUM,
        },
      }}>
      <Stack.Screen
        name="Restaurant"
        component={Restaurant}
        options={{
          unmountOnBlur: true,
          title: 'Restaurantes',
          headerLeft: () => <HeaderBack navigation={navigation} />,
          headerTintColor: Colors.WHITE,
          headerTitleStyle: {
            fontFamily: Typography.FONT_FAMILY_MEDIUM,
            fontSize: Typography.FONT_SIZE_20,
          },
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: Colors.PRIMARY,
          },
        }}
      />
      <Stack.Screen
        name="RestaurantProduct"
        component={RestaurantProduct}
        options={{unmountOnBlur: true, title: 'Produtos', headerShown: false}}
      />
      <Stack.Screen
        name="RestaurantDetails"
        component={RestaurantDetails}
        options={{
          unmountOnBlur: true,
          title: 'Detalhe do produto',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RestaurantProductDetails"
        component={RestaurantProductDetails}
        options={{
          unmountOnBlur: true,
          title: 'Detalhe do produto',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RestaurantPizzaDetails"
        component={RestaurantPizzaDetails}
        options={{
          unmountOnBlur: true,
          title: 'Detalhe do produto',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

const ShoppingStack = ({navigation}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.PRIMARY,
        },
        headerTintColor: Colors.WHITE,
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTitleStyle: {
          fontFamily: Typography.FONT_FAMILY_BOLD,
        },
        options: {
          unmountOnBlur: true,
        },
      }}>
      <Stack.Screen
        name="CompanySegment"
        component={CompanySegment}
        options={{
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
      <Stack.Screen
        name="Coupon"
        component={Coupon}
        options={{
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
      <Stack.Screen
        name="CouponRules"
        component={CouponRules}
        options={{
          title: 'Cupom',
          unmountOnBlur: true,
        }}
      />
      <Stack.Screen
        name="TipOtherValue"
        component={TipOtherValue}
        options={{
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
      <Stack.Screen
        name="DetailPayment"
        component={DetailPayment}
        options={{
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
      <Stack.Screen
        name="MyOrder"
        component={Order}
        options={{
          unmountOnBlur: true,
          title: 'Meus pedidos',
          headerLeft: () => <HeaderBack navigation={navigation} />,
        }}
      />
      <Stack.Screen
        name="Payment"
        component={Payment}
        options={{
          unmountOnBlur: true,
          title: 'Pagamentos',
        }}
      />
      <Stack.Screen
        name="PaymentMethods"
        component={PaymentMethods}
        options={{
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
      <Stack.Screen
        name="PaymentStatus"
        component={PaymentStatus}
        options={{
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
      <Stack.Screen
        name="PaymentStatusItems"
        component={PaymentStatusItems}
        options={{
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
      <Stack.Screen
        name="Schedule"
        headerMode="none"
        component={Schedule}
        options={{
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
    </Stack.Navigator>
  );
};

const SplashStack = () => {
  return (
    <Stack.Navigator initialRouteName="Splash" headerMode="none">
      <Stack.Screen name="Splash" component={Splash} />
    </Stack.Navigator>
  );
};

const ConnectivityStack = () => {
  return (
    <Stack.Navigator initialRouteName="Connectivity" headerMode="none">
      <Stack.Screen name="Connectivity" component={Connectivity} />
    </Stack.Navigator>
  );
};

const FavoriteStack = ({navigation}) => {
  return (
    <Stack.Navigator initialRouteName="Favorites" headerMode="none">
      <Stack.Screen
        name="Favorites"
        component={Favorite}
        options={{
          unmountOnBlur: true,
          title: 'Favoritos',
          headerLeft: () => <HeaderBack navigation={navigation} />,
        }}
      />
    </Stack.Navigator>
  );
};

const CompaniesCouponStack = ({navigation}) => {
  return (
    <Stack.Navigator initialRouteName="CompaniesCoupon" headerMode="none">
      <Stack.Screen
        name="CompaniesCoupon"
        component={CompaniesCoupon}
        options={{
          unmountOnBlur: true,
          title: 'Estabelecimentos',
          headerLeft: () => <HeaderBack navigation={navigation} />,
        }}
      />
    </Stack.Navigator>
  );
};

const SupermarketStack = ({navigation}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.PRIMARY,
        },
        headerTintColor: Colors.WHITE,
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTitleStyle: {
          fontFamily: Typography.FONT_FAMILY_BOLD,
        },
      }}>
      <Stack.Screen
        name="Product"
        component={Product}
        options={{unmountOnBlur: true, title: 'Produtos', headerShown: false}}
      />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetails}
        options={{
          headerShown: false,
          unmountOnBlur: true,
          title: 'Detalhes do produtos',
          headerLeft: () => <HeaderBack navigation={navigation} />,
        }}
      />
      <Stack.Screen
        name="Supermarket"
        component={Supermarket}
        options={{
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
      <Stack.Screen
        name="SupermarketDetails"
        component={SupermarketDetails}
        options={{
          headerShown: false,
          title: 'Mercado',
          unmountOnBlur: true,
        }}
      />
    </Stack.Navigator>
  );
};

const globalNavigationOptions = {
  headerStyle: {
    backgroundColor: '#1B7FD0',
  },
  headerLeftContainerStyle: {
    marginLeft: 10,
  },

  headerTintColor: '#fff',
  headerTitleAlign: 'center',
  headerTitleStyle: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
};

const SupportStack = ({navigation}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.PRIMARY,
        },
        headerTintColor: Colors.WHITE,
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTitleStyle: {
          fontFamily: Typography.FONT_FAMILY_BOLD,
        },
      }}>
      <Stack.Screen
        name="ChatPayment"
        component={ChatPayment}
        options={{
          ...globalNavigationOptions,
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
      <Stack.Screen
        name="Support"
        component={Support}
        options={{
          headerShown: false,
          unmountOnBlur: true,
        }}
      />
    </Stack.Navigator>
  );
};

const MessageStack = ({navigation}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: Colors.PRIMARY,
        },
        headerTintColor: Colors.WHITE,
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTitleStyle: {
          fontFamily: Typography.FONT_FAMILY_BOLD,
        },
      }}>
      <Stack.Screen
        name="Messages"
        component={Messages}
        options={{
          title: 'Mensagem',
          unmountOnBlur: true,
          headerLeft: () => <HeaderBack navigation={navigation} />,
        }}
      />
      <Stack.Screen
        name="Conversation"
        component={Conversation}
        options={{
          title: '',
          unmountOnBlur: true,
          headerLeft: () => <HeaderBack navigation={navigation} />,
        }}
      />
    </Stack.Navigator>
  );
};

const PagStack = ({navigation}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: Colors.PRIMARY,
        },
        headerTintColor: Colors.WHITE,
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTitleStyle: {
          fontFamily: Typography.FONT_FAMILY_BOLD,
        },
      }}>
      <Stack.Screen
        name="Pag"
        component={Pag}
        options={{
          title: i18next.t('races'),
          unmountOnBlur: true,
          headerLeft: () => <HeaderBack navigation={navigation} />,
        }}
      />

      <Stack.Screen
        name="CardPag"
        component={CardPag}
        options={{
          unmountOnBlur: true,
          headerLeft: () => <HeaderBack navigation={navigation} />,
        }}
      />
    </Stack.Navigator>
  );
};

const WalletStack = ({navigation}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: Colors.PRIMARY,
        },
        headerTintColor: Colors.WHITE,
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTitleStyle: {
          fontFamily: Typography.FONT_FAMILY_BOLD,
        },
      }}>
      <Stack.Screen
        name="Wallet"
        component={Wallet}
        options={{
          unmountOnBlur: true,
          headerLeft: () => <HeaderBack navigation={navigation} />,
        }}
      />

      <Stack.Screen
        name="Cashback"
        component={Cashback}
        options={{
          unmountOnBlur: true,
          headerLeft: () => <HeaderBack navigation={navigation} />,
        }}
      />

      <Stack.Screen
        name="Recommendation"
        component={Recommendation}
        options={{
          unmountOnBlur: true,
          headerLeft: () => <HeaderBack navigation={navigation} />,
        }}
      />
    </Stack.Navigator>
  );
};

const CompaniesStack = ({navigation}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: Colors.PRIMARY,
        },
        headerTintColor: Colors.WHITE,
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTitleStyle: {
          fontFamily: Typography.FONT_FAMILY_BOLD,
        },
      }}>
      <Stack.Screen
        name="Companies"
        component={Companies}
        options={{
          unmountOnBlur: true,
          headerLeft: () => <HeaderBack navigation={navigation} />,
        }}
      />

      <Stack.Screen
        name="Cob"
        component={Cob}
        options={{
          unmountOnBlur: true,
          headerLeft: () => <HeaderBack navigation={navigation} />,
        }}
      />

      <Stack.Screen name="Reg" component={RegisteredCards} />
    </Stack.Navigator>
  );
};

const IndicateStack = ({navigation}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: Colors.PRIMARY,
        },
        headerTintColor: Colors.WHITE,
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTitleStyle: {
          fontFamily: Typography.FONT_FAMILY_BOLD,
        },
      }}>
      <Stack.Screen
        name="Send"
        component={Send}
        options={{
          unmountOnBlur: true,
          headerLeft: () => <HeaderBack navigation={navigation} />,
        }}
      />
    </Stack.Navigator>
  );
};

const SupStack = ({navigation}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: Colors.PRIMARY,
        },
        headerTintColor: Colors.WHITE,
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTitleStyle: {
          fontFamily: Typography.FONT_FAMILY_BOLD,
        },
      }}>
      <Stack.Screen
        name="Sup"
        component={Sup}
        options={{
          unmountOnBlur: true,
          headerLeft: () => <HeaderBack navigation={navigation} />,
        }}
      />

      <Stack.Screen
        name="Email"
        component={Email}
        options={{
          unmountOnBlur: true,
          headerLeft: () => <HeaderBack navigation={navigation} />,
        }}
      />
      <Stack.Screen
        name="RunCar"
        component={RunCar}
        options={{
          unmountOnBlur: true,
          headerLeft: () => <HeaderBack navigation={navigation} />,
        }}
      />
    </Stack.Navigator>
  );
};
const SearchStack = ({navigation}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: Colors.PRIMARY,
        },
        headerTintColor: Colors.WHITE,
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTitleStyle: {
          fontFamily: Typography.FONT_FAMILY_BOLD,
        },
      }}>
      <Stack.Screen
        name="Search"
        component={Search}
        options={{
          title: 'Busca',
          unmountOnBlur: true,
          headerLeft: () => <HeaderBack navigation={navigation} />,
        }}
      />
    </Stack.Navigator>
  );
};

const RideAndTravelStack = ({navigation}) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="RideAndTravel"
        component={RideAndTravel}
        options={{
          headerLeft: () => (
            <Icon
              name="chevron-left"
              size={27}
              onPress={() => navigation.navigate('Home', {screen: 'Home'})}
              color={Colors.PRIMARY}
              style={{paddingLeft: 19}}
            />
          ),
          headerTitle: () => {},
          headerRight: () => (
            <HomeButton navigation={navigation} color={Colors.BLUE} />
          ),
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      />

      <Stack.Screen
        name="SelectDestiny"
        component={SelectDestiny}
        options={{
          headerLeft: () => (
            <Icon
              name="chevron-left"
              size={27}
              onPress={() => {
                console.log('voltar ...');
                navigation.navigate('Home', {screen: 'Home'});
              }}
              color={Colors.PRIMARY}
              style={{paddingLeft: 19}}
            />
          ),
          headerTitle: () => {},
          headerRight: () => (
            <HomeButton navigation={navigation} color={Colors.BLUE} />
          ),
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      />

      <Stack.Screen
        name="SelectRide"
        component={SelectRide}
        options={{
          headerLeft: () => (
            <Icon
              name="chevron-left"
              size={27}
              onPress={() =>
                navigation.navigate('SelectDestiny', {screen: 'SelectDestiny'})
              }
              color={Colors.PRIMARY}
              style={{paddingLeft: 19}}
            />
          ),
          headerTitle: () => {},
          headerRight: () => (
            <HomeButton navigation={navigation} color={Colors.BLUE} />
          ),
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      />

      <Stack.Screen
        name="ConfirmRide"
        component={ConfirmRide}
        options={{
          headerLeft: () => (
            <Icon
              name="chevron-left"
              size={27}
              onPress={() =>
                navigation.navigate('SelectRide', {screen: 'SelectRide'})
              }
              color={Colors.PRIMARY}
              style={{paddingLeft: 19}}
            />
          ),
          headerTitle: () => {},
          headerRight: () => (
            <HomeButton navigation={navigation} color={Colors.BLUE} />
          ),
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      />

      <Stack.Screen
        name="Ride"
        component={Ride}
        options={{
          header: () => {},
        }}
      />
      <Stack.Screen
        name="evaluationScreen"
        component={evaluationScreen}
        options={{
          header: () => {},
        }}
      />

      <Stack.Screen
        name="RaceAccepted"
        component={RaceAccepted}
        options={{
          header: () => {},
        }}
      />

      <Stack.Screen
        name="CancelBooking"
        component={CancelBooking}
        options={{
          header: () => {},
        }}
      />

      <Stack.Screen
        name="ChangeRoute"
        component={ChangeRoute}
        options={{
          header: () => {},
        }}
      />

      <Stack.Screen
        name="History"
        component={History}
        options={{
          header: () => {},
        }}
      />

      <Stack.Screen
        name="Detail"
        component={Detail}
        options={{
          header: () => {},
        }}
      />

      <Stack.Screen
        name="AutoBoard"
        component={AutoBoard}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

const CashBackStack = ({navigation}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: Colors.PRIMARY,
        },
        headerTintColor: Colors.WHITE,
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTitleStyle: {
          fontFamily: Typography.FONT_FAMILY_BOLD,
        },
      }}
      initialRouteName="cashBack">
      <Stack.Screen
        name="cashBack"
        component={cashBack}
        options={{
          title: 'Busca',
          unmountOnBlur: true,
          headerLeft: () => <HeaderBack navigation={navigation} />,
        }}
      />
      <Stack.Screen
        name="bankStatement"
        component={bankStatement}
        options={{
          title: 'Busca',
          unmountOnBlur: true,
          headerLeft: () => <HeaderBack navigation={navigation} />,
        }}
      />
    </Stack.Navigator>
  );
};

export {
  CustomerStack,
  MessageStack,
  // RunStack,
  PagStack,
  WalletStack,
  CompaniesStack,
  IndicateStack,
  SupStack,
  LocationStack,
  NewUserStack,
  LoginStack,
  PermissionsStack,
  HomeStack,
  RestaurantStack,
  ShoppingStack,
  SplashStack,
  ConnectivityStack,
  SupermarketStack,
  SupportStack,
  SearchStack,
  FavoriteStack,
  CompaniesCouponStack,
  TermsStack,
  TermsDescriptionStack,
  RideAndTravelStack,
  CashBackStack,
};
