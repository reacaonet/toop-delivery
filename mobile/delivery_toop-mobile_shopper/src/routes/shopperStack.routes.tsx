import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';
const Stack = createStackNavigator();

import Home from '../screens/home';
import Order from '../screens/order';
import Product from '../screens/product';
import Chat from '../screens/chat';

// common options, across multiple screens
const globalNavigationOptions = {
  headerStyle: {
    backgroundColor: '#dd3527',
  },
  headerLeftContainerStyle: {
    marginLeft: 10,
  },

  headerTintColor: '#fff',
  headerTitleAlign: 'center',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
};

const homeHeaderStyle = {
  headerStyle: {
    height: 100,
    backgroundColor: '#dd3527',
  },
  headerTitleStyle: {
    paddingBottom: 10,
  },
  headerLeftContainerStyle: {
    marginLeft: 10,
    paddingBottom: 10,
  },
};

interface ShopperStackProps {
  navigation: any;
}

const ShopperStack = ({navigation}: ShopperStackProps) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          title: 'Gojá Comerciante',
          ...globalNavigationOptions,
          ...homeHeaderStyle,

          headerLeft: () => (
            <Icon
              name="menu"
              color="#fff"
              size={28}
              onPress={() => navigation.toggleDrawer()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Order"
        component={Order}
        options={{
          title: 'Detalhes do Pedido',
          headerLeft: () => (
            <Icon
              name="chevron-left"
              size={30}
              color="#fff"
              onPress={() => navigation.goBack()}
            />
          ),
          ...globalNavigationOptions,
        }}
      />
      <Stack.Screen
        name="Product"
        component={Product}
        options={{
          title: 'Adicionar Produto',
          headerLeft: () => null,
          ...globalNavigationOptions,
        }}
      />
      <Stack.Screen
        name="Chat"
        component={Chat}
        options={{
          ...globalNavigationOptions,
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export {ShopperStack};
