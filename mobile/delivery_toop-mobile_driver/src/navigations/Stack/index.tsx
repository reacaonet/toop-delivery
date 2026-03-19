import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

/** Screens */
import Routers from './../routes';

export function SplashStack() {
  return (
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen name="Splash" component={Routers.Splash} />
    </Stack.Navigator>
  );
}

export const TermsStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Terms"
      screenOptions={{
        headerStyle: { backgroundColor: '#333' },
        headerTintColor: '#FFFFFF',
        animationTypeForReplace: 'push',
        headerShown: false,
      }}>
      <Stack.Screen name="Terms" component={Routers.Terms} />
    </Stack.Navigator>
  );
};

export function LoginStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="LoginScreen">
      <Stack.Screen name="LoginScreen" component={Routers.Login} />
    </Stack.Navigator>
  );
}

export const BoardingStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Qr"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Qr" component={Routers.Qr} />
      <Stack.Screen name="SelectDestiny" component={Routers.SelectDestiny} />
      <Stack.Screen name="SelectRider" component={Routers.SelectRider} />
      <Stack.Screen name="ConfirmRide" component={Routers.ConfirmRide} />
      <Stack.Screen name="Ride" component={Routers.Ride} />
    </Stack.Navigator>
  );
};

export const RegisterStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Phone"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Phone" component={Routers.RegisterPhone} />
      <Stack.Screen
        name="DynamicRegister"
        component={Routers.DynamicRegister}
      />
      <Stack.Screen name="Name" component={Routers.RegisterName} />
      <Stack.Screen name="Email" component={Routers.RegisterEmail} />
      <Stack.Screen name="BirthDate" component={Routers.RegisterBirthDate} />
      <Stack.Screen name="CPF" component={Routers.RegisterCPF} />
      <Stack.Screen name="RG" component={Routers.RegisterRG} />
      <Stack.Screen name="Genre" component={Routers.Genre} />
      <Stack.Screen name="Region" component={Routers.RegisterRegion} />
      <Stack.Screen name="ImageSelf" component={Routers.RegisterImageSelf} />
      <Stack.Screen name="ImageCnh" component={Routers.RegisterImageCnh} />
      <Stack.Screen name="ImageCrlv" component={Routers.RegisterImageCrlv} />
      <Stack.Screen name="Bank" component={Routers.RegisterBank} />
      <Stack.Screen name="Password" component={Routers.RegisterPassword} />
      <Stack.Screen
        name="ConfirmPassword"
        component={Routers.RegisterConfirmPassword}
      />
      <Stack.Screen
        name="ImageCriminal"
        component={Routers.RegisterImageCriminal}
      />
    </Stack.Navigator>
  );
};
