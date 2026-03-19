import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Home from '../screens/home';
import Timer from '../screens/timer';
import Orders from '../screens/orders';
import Delivery from '../screens/delivery';

import Product from '../screens/product';
import Rela from '../screens/rela';
import Chat from '../screens/chat';
import Detail from '../screens/orders/components/order';
import DetailInputs from '../screens/orders/components/order/modal';
import DetailDelivery from '../screens/orders/components/progress/index';
import DetailConcl from '../screens/orders/components/concluded/index';

/** supermercado */
import DepartmentList from '../screens/supermarket/department/list';
import DepartmentCreate from '../screens/supermarket/department/create';
import DepartmentEdit from '../screens/supermarket/department/edit';

import DepartmentAddProduct from '../screens/supermarket/products/create';
import DepartmentEditProduct from '../screens/supermarket/products/edit';
import DepartmentProducts from '../screens/supermarket/products/list';

/** restaurante */
import CategoryList from '../screens/restaurant/category/list';
import CategoryCreate from '../screens/restaurant/category/create';
import CategoryEdit from '../screens/restaurant/category/edit';

import RestaurantAddProduct from '../screens/restaurant/products/create';
import RestaurantEditProduct from '../screens/restaurant/products/edit';
import RestaurantProducts from '../screens/restaurant/products/list';

import {
  HeaderIcon,
  HeaderBack,
  Back,
  HeaderSearch,
  HeaderSwitch,
  BackStore,
  HeaderAvailability,
} from '../components/shared/header';
import {Typography, Colors} from '../styles';

const globalNavigationOptions = {
  headerStyle: {
    backgroundColor: Colors.GRAY,
  },
  headerLeftContainerStyle: {
    marginLeft: 10,
  },
  headerTintColor: Colors.GRAY,
  headerTitleAlign: 'center',
  headerTitleStyle: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
};

const globalNavigationOptionsDetail = {
  headerStyle: {
    backgroundColor: Colors.WHITE,
  },
  headerLeftContainerStyle: {
    marginLeft: 10,
  },
  headerTintColor: Colors.GRAY,
  headerTitleAlign: 'center',
  headerTitleStyle: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
};

const homeHeaderStyle = {
  headerStyle: {
    height: 100,
    backgroundColor: Colors.HEADER,
  },
  headerTitleStyle: {
    paddingBottom: 10,
    color: Colors.GRAY,
  },

  headerLeftContainerStyle: {
    marginLeft: 10,
    paddingBottom: 10,
  },
};
const HeaderDetail = {
  headerStyle: {
    height: 100,
    backgroundColor: Colors.WHITE,
  },
  headerTitleStyle: {
    paddingBottom: 10,
    color: Colors.GRAY,
  },

  headerLeftContainerStyle: {
    marginLeft: 10,
    paddingBottom: 10,
  },
};

const homeStyle = {
  headerStyle: {
    height: 100,
    backgroundColor: Colors.HEADER,
  },
  headerTitleStyle: {
    paddingBottom: 10,
    color: Colors.GRAY,
    display: 'none',
  },

  headerLeftContainerStyle: {
    marginLeft: 10,
    paddingBottom: 10,
  },
};
const Stack = createStackNavigator();

const ShopperStack: any = (props: any) => {
  return (
    <Stack.Navigator initialRouteName="Orders">
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          ...globalNavigationOptions,
          ...homeStyle,
          headerLeft: () => <HeaderIcon navigation={props.navigation} />,
          headerRight: () => <HeaderAvailability />,
        }}
      />
      <Stack.Screen
        name="Orders"
        component={Orders}
        options={{
          title: 'Pedidos',
          ...globalNavigationOptions,
          ...homeHeaderStyle,
          headerLeft: () => <HeaderIcon navigation={props.navigation} />,
          headerRight: () => <HeaderAvailability />,
        }}
      />

      <Stack.Screen
        name="Detail"
        component={Detail}
        options={{
          title: 'Detalhes do pedido',
          ...globalNavigationOptionsDetail,
          ...HeaderDetail,
          headerLeft: () => <Back navigation={props.navigation} />,
        }}
      />

      <Stack.Screen
        name="DetailInputs"
        component={DetailInputs}
        options={{
          title: 'Detalhes do pedido',
          ...globalNavigationOptionsDetail,
          ...HeaderDetail,
          headerLeft: () => <Back navigation={props.navigation} />,
        }}
      />

      <Stack.Screen
        name="DetailDelivery"
        component={DetailDelivery}
        options={{
          title: 'Detalhes do pedido',
          ...globalNavigationOptionsDetail,
          ...HeaderDetail,
          headerLeft: () => <Back navigation={props.navigation} />,
        }}
      />
      <Stack.Screen
        name="DetailConcl"
        component={DetailConcl}
        options={{
          title: 'Detalhes do pedido',
          ...globalNavigationOptionsDetail,
          ...HeaderDetail,
          headerLeft: () => <Back navigation={props.navigation} />,
        }}
      />

      <Stack.Screen
        name="Department"
        component={DepartmentCreate}
        options={{
          title: 'Novo departamento',
          ...globalNavigationOptionsDetail,
          ...HeaderDetail,
          headerLeft: () => <BackStore navigation={props.navigation} />,
        }}
      />
      <Stack.Screen
        name="Edit"
        component={DepartmentEdit}
        options={{
          title: 'Editar departamento',
          ...globalNavigationOptionsDetail,
          ...HeaderDetail,
          headerLeft: () => <BackStore navigation={props.navigation} />,
        }}
      />

      <Stack.Screen
        name="Store"
        component={DepartmentList}
        options={{
          title: 'Minha Loja',
          ...globalNavigationOptions,
          ...homeHeaderStyle,
          headerLeft: () => <HeaderIcon navigation={props.navigation} />,
          // headerRight: () => <HeaderSearch />,
        }}
      />

      <Stack.Screen
        name="Products"
        component={DepartmentProducts}
        options={({route}: any) => ({
          title: route?.params?.title ?? 'Produtos',
          ...globalNavigationOptions,
          ...homeHeaderStyle,
          headerLeft: () => <BackStore navigation={props.navigation} />,
        })}
      />

      <Stack.Screen
        name="NewProduct"
        component={DepartmentAddProduct}
        options={{
          title: 'Novo Produto',
          ...globalNavigationOptionsDetail,
          ...HeaderDetail,
          headerLeft: () => <BackStore navigation={props.navigation} />,
        }}
      />

      <Stack.Screen
        name="EditProduct"
        component={DepartmentEditProduct}
        options={{
          title: 'Editar Produto',
          ...globalNavigationOptionsDetail,
          ...HeaderDetail,
          headerLeft: () => <BackStore navigation={props.navigation} />,
        }}
      />

      <Stack.Screen
        name="CategoryList"
        component={CategoryList}
        options={{
          title: 'Minha Loja',
          ...globalNavigationOptions,
          ...homeHeaderStyle,
          headerLeft: () => <HeaderIcon navigation={props.navigation} />,
          // headerRight: () => <HeaderSearch />,
        }}
      />

      <Stack.Screen
        name="CategoryCreate"
        component={CategoryCreate}
        options={{
          title: 'Nova categoria',
          ...globalNavigationOptionsDetail,
          ...HeaderDetail,
          headerLeft: () => <BackStore navigation={props.navigation} />,
        }}
      />
      <Stack.Screen
        name="CategoryEdit"
        component={CategoryEdit}
        options={{
          title: 'Editar categoria',
          ...globalNavigationOptionsDetail,
          ...HeaderDetail,
          headerLeft: () => <BackStore navigation={props.navigation} />,
        }}
      />

      <Stack.Screen
        name="RestaurantProducts"
        component={RestaurantProducts}
        options={({route}: any) => ({
          title: route?.params?.title ?? 'Produtos',
          ...globalNavigationOptions,
          ...homeHeaderStyle,
          headerLeft: () => <BackStore navigation={props.navigation} />,
        })}
      />

      <Stack.Screen
        name="RestaurantAddProduct"
        component={RestaurantAddProduct}
        options={{
          title: 'Novo Produto',
          ...globalNavigationOptionsDetail,
          ...HeaderDetail,
          headerLeft: () => <BackStore navigation={props.navigation} />,
        }}
      />

      <Stack.Screen
        name="RestaurantEditProduct"
        component={RestaurantEditProduct}
        options={{
          title: 'Editar Produto',
          ...globalNavigationOptionsDetail,
          ...HeaderDetail,
          headerLeft: () => <BackStore navigation={props.navigation} />,
        }}
      />

      <Stack.Screen
        name="Chat"
        component={Chat}
        options={{
          headerShown: false,

          headerLeft: () => <Back navigation={props.navigation} />,
        }}
      />
      <Stack.Screen
        name="Timer"
        component={Timer}
        options={{
          title: 'Horário de atendimento',
          ...globalNavigationOptions,
          ...homeHeaderStyle,
          headerLeft: () => <HeaderIcon navigation={props.navigation} />,
        }}
      />

      <Stack.Screen
        name="Delivery"
        component={Delivery}
        options={{
          headerShown: false,
          ...globalNavigationOptions,
          headerLeft: () => <HeaderIcon navigation={props.navigation} />,
          headerRight: () => <HeaderSearch />,
        }}
      />

      <Stack.Screen
        name="Rela"
        component={Rela}
        options={{
          title: 'Relatórios',
          ...globalNavigationOptions,
          ...homeHeaderStyle,
          headerLeft: () => <HeaderIcon navigation={props.navigation} />,
        }}
      />
    </Stack.Navigator>
  );
};

// const OrderSupermarketStack: any = (props: any) => {
//   return (
//     <Stack.Navigator>
//       <Stack.Screen
//         name="order"
//         component={Order}
//         options={{
//           title: 'Detalhes do Pedido',
//           headerLeft: () => <HeaderIcon navigation={props.navigation} />,
//         }}
//       />
//       <Stack.Screen
//         name="Product"
//         component={Product}
//         options={{
//           title: 'Adicionar Produto',
//           headerLeft: () => <HeaderBack navigation={props.navigation} />,
//         }}
//       />
//     </Stack.Navigator>
//   );
// };

export {ShopperStack};
