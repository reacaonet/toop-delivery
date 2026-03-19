/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {connect} from 'react-redux';
import DrawerContent from './Drawer';
import {
  HomeStack,
  HistoryStack,
  DetailStack,
  ConnectivityStack,
  BackgroundStack,
} from './stack';

import LocationPermition from '../screens/permissions/location';
import AlertWindow from '../screens/permissions/alertWindow';
import Login from '../screens/login';
import Register from '../screens/register';
import Splash from '../screens/splash';
import Instructions from '../screens/instructions';
import TakePictures from '../screens/takePictures';
import ValidadePictures from '../screens/validadePictures';
import SendRegister from '../screens/sendRegister';

const Drawer = createDrawerNavigator();
const options: any = {
  unmountOnBlur: true,
  gestureEnabled: true,
};
const optionNoAuth: any = {
  unmountOnBlur: true,
  gestureEnabled: false,
};

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
          <DrawerContent {...props} onCleanAuth={onCleanAuth} />
        )}>
        {!userAuth || !userAuth.token || !userAuth.user ? (
          <>
            <Drawer.Screen
              name="Splash"
              component={Splash}
              options={optionNoAuth}
            />
            <Drawer.Screen
              name="LocationPermition"
              component={LocationPermition}
              options={optionNoAuth}
            />
            <Drawer.Screen
              name="AlertWindow"
              component={AlertWindow}
              options={optionNoAuth}
            />
            <Drawer.Screen
              name="Login"
              component={Login}
              options={optionNoAuth}
            />
            <Drawer.Screen
              name="Register"
              component={Register}
              options={optionNoAuth}
            />
            <Drawer.Screen
              name="Instructions"
              component={Instructions}
              options={optionNoAuth}
            />
            <Drawer.Screen
              name="TakePictures"
              component={TakePictures}
              options={optionNoAuth}
            />
            <Drawer.Screen
              name="ValidadePictures"
              component={ValidadePictures}
              options={optionNoAuth}
            />
            <Drawer.Screen
              name="SendRegister"
              component={SendRegister}
              options={optionNoAuth}
            />
          </>
        ) : (
          <>
            <Drawer.Screen
              name="Home"
              component={HomeStack}
              options={options}
            />
            <Drawer.Screen
              name="History"
              component={HistoryStack}
              options={options}
            />
            <Drawer.Screen
              name="Detail"
              component={DetailStack}
              options={options}
            />
            <Drawer.Screen
              name="Connectivity"
              component={ConnectivityStack}
              options={options}
            />
            <Drawer.Screen
              name="Background"
              component={BackgroundStack}
              options={{
                unmountOnBlur: true,
                gestureEnabled: false,
              }}
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
