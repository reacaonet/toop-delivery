/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar, NativeModules, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import Navigator from './navigations';
import { OTAProvider } from './services/ota/OTAProvider';
import UserRefreshToken from './services/service/tokenMessage/userRefreshToken';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';

/* Service */
import { createPassenger } from './services/provider/passenger/create';
import { setUser } from './store/actions/user';
import { listActiveRun } from './services//provider/passenger/activeRun';
import { getBooking, updateBooking } from './store/actions/booking';
import { linkToFranchise } from './services/provider/passenger/linkToFranchise';
import LocationCurrent from './services/location/locationCurrent';
import {
  getConfigurations,
  setConfigurations,
} from './store/actions/configurations';
import { listSettings } from './services/provider/settings/settings';
import { setCategory } from './store/actions/tab';

import TextDefault from './config/textdefaultProps';
import config from './config';

PushNotification.configure({
  onNotification: function (notification: any) {
    const title = notification?.title || 'GojáDelivery';

    PushNotification.localNotification({
      title: title,
      ...notification,
      channelId: 'fcm_fallback_notification_channel',
      smallIcon: 'ic_notification',
      vibrate: true,
      vibration: 1000,
      ignoreInForeground: false,
      priority: 'high',
      importance: 'high',
      popInitialNotification: true,
      requestPermissions: true,
    });

    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },
  popInitialNotification: true,
  requestPermissions: true,
});

/** Translate */
import * as i18next from './locales';
i18next.startTranslate();

const { InAppUpdateModule } = NativeModules;

TextDefault();

const App = () => {
  const dispatch: any = useDispatch();

  const {
    user: { user: userAuth = null },
    user: { guest = null },
  }: any = useSelector<any>(state => state);

  useEffect(() => {
    if (guest === false || guest === null) {
      UserRefreshToken(userAuth);
    }
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

    dispatch(getConfigurations());
  }, [userAuth?._id]);

  useEffect(() => {
    PushNotification.configure({
      onNotification: function (notification) {
        // console.log('NOTIFICATION:', notification);
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  }, []);

  useEffect(() => {
    if (guest === false || guest === null) {
      UserRefreshToken(userAuth);
    }

    if (userAuth && !userAuth?.passenger?._id) {
      newPassenger();
    } else {
      setLinkToFranchise(userAuth);
    }

    if (userAuth?.passenger?._id) {
      listActiveRun(userAuth?.passenger?._id).then(result => {
        if (result) {
          if (
            result &&
            (result?.status === 'accepted' ||
              result?.status === 'in_progress' ||
              result?.status === 'waiting')
          ) {
            dispatch(
              updateBooking({
                payload: {
                  status: result?.status,
                  booking: result || null,
                  origin: {
                    ...(result?.origin || {}),
                    latitude: result?.origin?.coordinates[1],
                    longitude: result?.origin?.coordinates[0],
                  },
                  destiny: {
                    ...(result?.destiny || {}),
                    latitude: result?.destiny[0]?.coordinates[1],
                    longitude: result?.destiny[0]?.coordinates[0],
                  },
                },
              }),
            );
          } else {
            dispatch(getBooking());
          }
        } else {
          dispatch({
            type: 'UPDATE_BOOKING_SAGA',
            payload: {
              status: 'create_request',
              booking: null,
            },
          });
        }
      });
    }
  }, [userAuth?._id, userAuth?.passenger?._id]);

  useEffect(() => {
    if (userAuth?.franchise) {
      listSettings(userAuth?.franchise).then(result => {
        if (
          result &&
          typeof result === 'object' &&
          Object.keys(result).length > 0
        ) {
          dispatch(
            setConfigurations({
              payload: {
                ...result,
              },
            }),
          );

          if (result?.serviceDefault) {
            dispatch(setCategory(result?.serviceDefault));
          } else {
            dispatch(setCategory('delivery'));
          }

          if (result?.languageDefault) {
            i18next.modifyTranslate(result?.languageDefault);
          }
        }
      });
    }
  }, [userAuth?.franchise]);

  const newPassenger = async () => {
    if (userAuth.person && userAuth.person._id) {
      const passenger = await createPassenger({
        person: userAuth.person._id,
        status: true,
      });

      if (passenger && passenger._id) {
        userAuth.passenger = passenger;
        dispatch(setUser({ user: userAuth }));
        setLinkToFranchise(userAuth);
      }
    }
  };

  // vincular a uma franquia
  const setLinkToFranchise = async (user: any) => {
    const result = await LocationCurrent().getLocation();

    if (!result || !result?.latitude || !result?.longitude) {
      return;
    }

    const latitude = result?.latitude;
    const longitude = result?.longitude;

    if (user?.passenger) {
      const respLink = await linkToFranchise(
        user?.person,
        user?.passenger,
        latitude,
        longitude,
      );

      if (respLink && respLink._id) {
        user.franchise = respLink._id;

        if (user.passenger) {
          user.passenger.franchise = respLink._id;
        }

        if (user.person) {
          user.person.franchise = respLink._id;
        }

        dispatch(
          setUser({
            user: user,
          }),
        );
      }
    }
  };

  return (
    <OTAProvider app="client" currentVersion="2.6.7" serverUrl="http://localhost:8500">
      <>
        <StatusBar
          translucent
          barStyle="light-content"
          backgroundColor="transparent"
        />
        {/* <NewMessage modal={modal} setModal={setModal} /> */}
        <Navigator />
      </>
    </OTAProvider>
  );
};

// const mapStateToProps = ({ user: user }) => {
//   return {
//     userAuth: user?.user ?? null,
//     guest: user?.guest ?? null,
//   };
// };

export default App;
