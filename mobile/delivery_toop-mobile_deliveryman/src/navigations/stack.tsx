import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Stack = createStackNavigator();
import Home from '../screens/home';
import earningDetails from '../screens/earningDetails';
import history from '../screens/history';
import Detail from '../screens/details';
import Connectivity from '../screens/connectivity';
import Background from '../screens/background';
import {Typography} from '../styles';
import {Colors} from '../styles';

/* HEADER */
import HeaderRightStatus from '../components/shared/header/headerRightStatus';

const globalNavigationOptions = {
  headerStyle: {
    backgroundColor: Colors.PRIMARY,
  },
  headerLeftContainerStyle: {
    marginLeft: 10,
  },

  headerTintColor: '#fff',
  headerTitleAlign: 'center',
  headerTitleStyle: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    // fontSize: 0,
  },
};

const homeHeaderStyle = {
  headerStyle: {
    height: 100,
    backgroundColor: Colors.PRIMARY,
  },
  headerTitleStyle: {
    paddingBottom: 10,
  },
  headerLeftContainerStyle: {
    marginLeft: 10,
    paddingBottom: 10,
  },
};

const HomeStack: any = (props: any) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          title: 'ToopDelivery',
          ...globalNavigationOptions,
          ...homeHeaderStyle,
          // headerLeft: () => <HeaderIcon navigation={props.navigation} />,
          headerLeft: () => (
            <Icon
              name="menu"
              color="#fff"
              size={28}
              onPress={() => props.navigation.toggleDrawer()}
            />
          ),
          headerRight: () => <HeaderRightStatus />,
        }}
      />
    </Stack.Navigator>
  );
};

const HistoryStack: any = (props: any) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="History"
        component={history}
        options={{
          title: 'Faturamento',
          ...globalNavigationOptions,
          // headerLeft: () => <HeaderIcon navigation={props.navigation} />,
          headerLeft: () => (
            <Icon
              name="menu"
              color="#fff"
              size={28}
              onPress={() => props.navigation.toggleDrawer()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="EarningDetails"
        component={earningDetails}
        options={{
          title: 'Detalhes',
          ...globalNavigationOptions,
          // headerLeft: () => <HeaderIcon navigation={props.navigation} />,
          headerLeft: () => (
            <Icon
              name="menu"
              color="#fff"
              size={28}
              onPress={() => props.navigation.toggleDrawer()}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

const DetailStack: any = (props: any) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Detail"
        component={Detail}
        options={{
          title: 'Detalhes da entrega',
          ...globalNavigationOptions,
          // headerLeft: () => <HeaderIcon navigation={props.navigation} />,
          headerLeft: () => (
            <Icon
              name="menu"
              color="#fff"
              size={28}
              onPress={() => props.navigation.toggleDrawer()}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

const ConnectivityStack: any = (props: any) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Connectivity"
        component={Connectivity}
        options={{
          title: 'Sem conexão',
          ...globalNavigationOptions,
        }}
      />
    </Stack.Navigator>
  );
};

const optionsBackgrond: any = {
  title: 'Background',
  ...globalNavigationOptions,
  headerShown: false,
};
const BackgroundStack: any = (_props: any) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Background"
        component={Background}
        options={optionsBackgrond}
      />
    </Stack.Navigator>
  );
};

export {
  HomeStack,
  HistoryStack,
  DetailStack,
  ConnectivityStack,
  BackgroundStack,
};
