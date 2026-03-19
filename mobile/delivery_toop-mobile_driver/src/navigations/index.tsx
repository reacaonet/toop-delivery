import * as React from 'react';
import { Platform } from 'react-native';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import DrawerContent from './Drawer';

/** Stack */
import { TermsStack, RegisterStack, BoardingStack } from './Stack';

/** Screens */
import Routers from './routes';

const Drawer = createDrawerNavigator();

const optionNoAuth: any = {
  unmountOnBlur: true,
  swipeEnabled: false,
};

const optionAuth: any = {
  unmountOnBlur: true,
  swipeEnabled: true,
};

const Routes = ({ navigationRef }: any) => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Drawer.Navigator
        drawerContent={(props: any) => <DrawerContent {...props} />}
        initialRouteName="Notification"
        defaultStatus={'closed'}
        screenOptions={{
          drawerStatusBarAnimation: 'slide',
          header: () => {
            return null;
          },
        }}>
        <Drawer.Screen
          name="Notification"
          component={Routers.Notification}
          options={optionNoAuth}
        />

        <Drawer.Screen
          name="LocationPermition"
          component={Routers.LocationPermition}
          options={optionNoAuth}
        />

        {Platform.OS === 'android' ? (
          <Drawer.Screen
            name="AlertWindow"
            component={Routers.AlertWindow}
            options={optionNoAuth}
          />
        ) : null}

        <Drawer.Screen
          name="Splash"
          component={Routers.Splash}
          options={optionNoAuth}
        />

        <Drawer.Screen
          name="Login"
          component={Routers.Login}
          options={optionNoAuth}
        />

        <Drawer.Screen
          name="ForgotPassword"
          component={Routers.ForgotPassword}
          options={optionNoAuth}
        />

        <Drawer.Screen
          name="TermsStack"
          component={TermsStack}
          options={optionNoAuth}
        />

        <Drawer.Screen
          name="Register"
          component={RegisterStack}
          options={optionNoAuth}
        />

        <Drawer.Screen
          name="DriverMap"
          component={Routers.DriverMap}
          options={optionAuth}
        />

        <Drawer.Screen
          name="Gain"
          component={Routers.Gain}
          options={optionAuth}
        />

        <Drawer.Screen
          name="HistoryRun"
          component={Routers.HistoryRun}
          options={optionAuth}
        />

        <Drawer.Screen
          name="HistoryGain"
          component={Routers.HistoryGain}
          options={optionAuth}
        />

        <Drawer.Screen
          name="DetailGain"
          component={Routers.DetailGain}
          options={optionAuth}
        />

        <Drawer.Screen
          name="Modal"
          component={Routers.Modal}
          options={optionAuth}
        />

        <Drawer.Screen
          name="Msg"
          component={Routers.Msg}
          options={optionAuth}
        />

        <Drawer.Screen
          name="Conversation"
          component={Routers.Conversation}
          options={optionAuth}
        />

        <Drawer.Screen
          name="Repasse"
          component={Routers.Repasse}
          options={optionAuth}
        />

        <Drawer.Screen
          name="Cadastro"
          component={Routers.Cadastro}
          options={optionAuth}
        />

        <Drawer.Screen
          name="HistoryRunning"
          component={Routers.HistoryRunning}
          options={optionAuth}
        />

        <Drawer.Screen
          name="Details"
          component={Routers.Details}
          options={optionAuth}
        />

        <Drawer.Screen
          name="Wallet"
          component={Routers.Wallet}
          options={optionAuth}
        />

        <Drawer.Screen
          name="Extrato"
          component={Routers.Extrato}
          options={optionAuth}
        />

        <Drawer.Screen
          name="History"
          component={Routers.History}
          options={optionAuth}
        />

        <Drawer.Screen
          name="HistoryCar"
          component={Routers.HistoryCar}
          options={optionAuth}
        />

        <Drawer.Screen
          name="Cars"
          component={Routers.Cars}
          options={optionAuth}
        />

        <Drawer.Screen
          name="CadCar"
          component={Routers.CadCar}
          options={optionAuth}
        />

        <Drawer.Screen
          name="SendCr"
          component={Routers.SendCr}
          options={optionAuth}
        />

        <Drawer.Screen
          name="CamCr"
          component={Routers.CamCr}
          options={optionAuth}
        />

        <Drawer.Screen
          name="ConfirmCrlv"
          component={Routers.ConfirmCrlv}
          options={optionAuth}
        />

        <Drawer.Screen
          name="CarDados"
          component={Routers.CarDados}
          options={optionAuth}
        />

        <Drawer.Screen
          name="Dados"
          component={Routers.Dados}
          options={optionAuth}
        />

        <Drawer.Screen
          name="SendCnh"
          component={Routers.SendCnh}
          options={optionAuth}
        />

        <Drawer.Screen
          name="ConfirmCn"
          component={Routers.ConfirmCn}
          options={optionNoAuth}
        />

        <Drawer.Screen
          name="CamCn"
          component={Routers.CamCn}
          options={optionNoAuth}
        />

        <Drawer.Screen
          name="Send"
          component={Routers.Send}
          options={optionAuth}
        />

        <Drawer.Screen
          name="Sup"
          component={Routers.Sup}
          options={optionAuth}
        />

        <Drawer.Screen
          name="SendEmail"
          component={Routers.SendEmail}
          options={optionNoAuth}
        />

        <Drawer.Screen
          name="QrStack"
          component={BoardingStack}
          options={optionAuth}
        />

        <Drawer.Screen
          name="TermsDrawer"
          component={Routers.TermsDrawer}
          options={optionNoAuth}
        />

        <Drawer.Screen
          name="ChosenDestinations"
          component={Routers.ChosenDestinations}
          options={optionAuth}
        />

        <Drawer.Screen
          name="MapDestinations"
          component={Routers.MapDestinations}
          options={optionAuth}
        />

        <Drawer.Screen
          name="CancelBooking"
          component={Routers.CacelBooking}
          options={optionAuth}
        />

        <Drawer.Screen
          name="RaceFare"
          component={Routers.RaceFare}
          options={optionAuth}
        />

        <Drawer.Screen
          name="EvaluationScreen"
          component={Routers.EvaluationScreen}
          options={optionAuth}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
