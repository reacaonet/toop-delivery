/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  LogBox,
  AppState,
  NativeModules,
  Platform,
  DeviceEventEmitter,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import TextDefault from './config/textdefaultProps';
import Navigator from './navigations';
import { navigationRef, navigate } from './navigations/rootNavigation';
import database, {
  FirebaseDatabaseTypes,
} from '@react-native-firebase/database';

/** Components */
import NewRace from './screens/newRace';

import { Colors } from './styles';
import config from './config';

/** Service */
import * as RootNavigation from './navigations/rootNavigation';
import { UserRefreshToken } from './services/provider/google/refreshToken';
import { ActiverRun } from './services/provider/booking/activeRun';
import {
  watchLocation,
  getLocation,
  clearWatch,
} from './services/provider/geolocation/location';
import {
  bookingEvaluation,
  bookingCanceled,
  blockedUser,
  changeRoute,
} from './services/provider/booking/firebaseBooking';
import drawOverlays from './services/permissions/drawOverlays';
import {
  startLocationNative,
  updateLocation,
} from './services/Background/backgroundActions';
import { StorageGet } from './services/deviceStorage';
import { listSettings } from './services/provider/settings/settings';

/** Components */
import Toast from './components/Toast/toast';

/** Translate */
import * as i18next from './locales';
i18next.startTranslate();

TextDefault();

LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
]);

const { InAppUpdateModule, OpenApp } = NativeModules;

const App = () => {
  const dispatch = useDispatch();
  const watchLoc = useRef<any>(null);
  const notify = useRef<FirebaseDatabaseTypes.Module | null>(null);
  const attempts = useRef(0);
  const {
    authUser: { user = null },
    booking: { booking = null },
    configurations = null,
  }: any = useSelector((state: any) => state);
  const subscription = useRef<any>(null);

  useEffect(() => {
    UserRefreshToken(user);

    if (user?._id) {
      dispatch({
        type: 'GET_LOCATION_SAGA',
      });
      // blackListToken();

      getLocation(dispatch, user);
      attempts.current = 0;
      getActiverRun();
    }
  }, [user?._id]);

  useEffect(() => {
    if (
      booking &&
      Array.isArray(booking) &&
      booking.length > 0 &&
      (booking[0]?.status === 'accepted' ||
        booking[0]?.status === 'in_progress')
    ) {
      if (watchLoc.current !== null) {
        clearWatch(watchLoc.current);
        watchLoc.current = null;
      }
    } else if (user?._id && watchLoc.current === null) {
      if (Platform.OS === 'ios') {
        watchLoc.current = watchLocation(dispatch, user);
      }
    }
  }, [user?._id, booking]);

  // useEffect(() => {
  //   const initEvent = async () => {
  //     const isPermission = await drawOverlays().isPermission();
  //     if (isPermission) {
  //       if (
  //         user?._id &&
  //         user?.online === true &&
  //         Platform.OS === 'android' &&
  //         parseInt(`${Platform.Version}`, 10) > 25 &&
  //         !subscription.current
  //       ) {
  //         subscription.current = AppState.addEventListener(
  //           'change',
  //           async nextAppState => {
  //             const userAuth = await StorageGet(config.tokenAuth);
  //             if (
  //               (nextAppState === 'background' ||
  //                 nextAppState === 'inactive') &&
  //               userAuth &&
  //               `${userAuth?.online}` === 'true'
  //             ) {
  //               OpenApp.floatingWindow();
  //             } else if (nextAppState === 'active') {
  //               OpenApp.closeWindow();
  //             }
  //           },
  //         );
  //       } else if (
  //         Platform.OS === 'android' &&
  //         parseInt(`${Platform.Version}`, 10) > 25
  //       ) {
  //         try {
  //           OpenApp.closeWindow();

  //           if (subscription) {
  //             subscription.current.remove();
  //             subscription.current = null;
  //           }
  //         } catch (err) {
  //           //
  //         }
  //       }
  //     }
  //   };

  //   initEvent();
  // }, [user?._id, user?.online]);

  useEffect(() => {
    const verifyUpdate = async () => {
      try {
        if (Platform.OS === 'android' && config.environment === 'Production') {
          await InAppUpdateModule.verifyUpdate();
        }
      } catch (err) {
        console.log('fail test ', err);
      }
    };

    verifyUpdate();
  }, []);

  useEffect(() => {
    if (user?._id) {
      if (!notify.current) {
        notify.current = database();
        notify.current
          .ref(`${config.FIREBASE_PATH}driver/${user?._id}`)
          .on('value', async (snapshot: any) => {
            try {
              const respNotify = snapshot.val();
              if (
                respNotify?.type === 'race_concluded' &&
                respNotify?.booking
              ) {
                bookingEvaluation(user, respNotify, dispatch, navigate);
              } else if (
                respNotify?.type === 'race_canceled' &&
                respNotify?.booking
              ) {
                bookingCanceled(user, dispatch, navigate);
              } else if (respNotify?.type === 'block') {
                blockedUser(user, dispatch, navigate, respNotify);
              } else if (respNotify?.type === 'change-route') {
                changeRoute(user, respNotify, dispatch, navigate);
              }
            } catch (_err) {
              //
            }
          });
      }
    }
  }, [user?._id]);

  // default configurations
  useEffect(() => {
    if (user?.franchise) {
      listSettings(user?.franchise).then(result => {
        if (result) {
          dispatch({
            type: 'SET_CONFIGURATION_SAGA',
            payload: {
              ...result,
            },
          });

          console.log('languageDefault', result?.languageDefault);
          i18next.modifyTranslate(result?.languageDefault);
        }
      });
    }
  }, [user?.franchise]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      DeviceEventEmitter.removeAllListeners('onSessionLocation');
      DeviceEventEmitter.removeAllListeners('onCoordinate');

      DeviceEventEmitter.addListener('onSessionLocation', async (e: any) => {
        startLocationNative(e);
      });

      DeviceEventEmitter.addListener('onCoordinate', async (coord: any) => {
        updateLocation(coord, dispatch);
      });
    }
  }, []);

  const getActiverRun = async (): Promise<any> => {
    try {
      if (attempts.current > 5) {
        return;
      }

      const result = await ActiverRun(user?._id);

      if (result && Array.isArray(result) && result.length > 0) {
        dispatch({
          type: 'UPDATE_BOOKING_SAGA',
          payload: {
            status: result[0].status,
            booking: result,
          },
        });
      } else if (result && Array.isArray(result) && result.length === 0) {
        dispatch({
          type: 'CLEAN_BOOKING_SAGA',
        });
      } else {
        attempts.current++;
        return await getActiverRun();
      }
    } catch (err) {
      attempts.current++;
      return await getActiverRun();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={configurations?.statusBar?.barStyle || 'light-content'}
        backgroundColor={
          configurations?.statusBar?.backgroundColor || Colors.GRAY_DARK
        }
        translucent={configurations?.statusBar?.translucent || false}
      />
      <Navigator navigationRef={navigationRef} />

      <NewRace />
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  containerPip: {
    flex: 1,
    backgroundColor: 'rgba(52, 52, 52, 0.1)',
  },
});

export default App;
