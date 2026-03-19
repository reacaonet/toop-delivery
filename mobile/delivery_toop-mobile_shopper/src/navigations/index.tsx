/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {connect} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import DrawerContent from './Drawer';
import {ShopperStack} from './stack';

import Login from '../screens/login';
import Splash from '../screens/splash';

const Drawer = createDrawerNavigator();
const options: any = {unmountOnBlur: true};

type RoutesProps = {
  userAuth: any;
  onGetAuth: Function;
  onCleanAuth: Function;
};

const Routes = ({userAuth, onGetAuth, onCleanAuth}: RoutesProps) => {
  useEffect(() => {
    onGetAuth();
    return () => {};
  }, []);

  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props: any) => (
          <DrawerContent
            {...props}
            onCleanAuth={onCleanAuth}
            userAuth={userAuth}
          />
        )}>
        {!userAuth || !userAuth.token || !userAuth.user ? (
          <>
            <Drawer.Screen name="Splash" component={Splash} options={options} />
            <Drawer.Screen name="Login" component={Login} options={options} />
          </>
         ) : ( 
          <>
            <Drawer.Screen
              name="Shopper"
              component={ShopperStack}
              options={options}
            />
          </>
        )} 
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onGetAuth: () => dispatch({type: 'GET_USER_SAGA'}),
    onCleanAuth: () => dispatch({type: 'CLEAN_USER_SAGA'}),
  };
};

const mapStateToProps = ({authUser}: any) => {
  return {
    userAuth: authUser,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Routes);
