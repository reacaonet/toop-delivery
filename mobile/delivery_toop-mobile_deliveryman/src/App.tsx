/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import 'react-native-gesture-handler';
import {StatusBar, Modal, Text, TextInput, Alert} from 'react-native';
import {connect} from 'react-redux';
import {updateStatusOrder, listOrderOne} from './services/provider/order';
import {
  updateDeliveryMan,
  notificationReceived,
} from './services/provider/deliveryMan';

import NewOrder from './components/shared/modals/NewOrder';
import IsNotConnected from './components/shared/alert/isNotConnected';

import PushNotification, {
  PushNotificationObject,
} from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';

import {newRaceHistory} from './services/provider/deliveryMan';

import {
  watchPosition,
  cleanMonitorLocation,
  locationDelivery,
} from './services/location/watchPosition';
import {
  distanceLatLonInKm,
  formatDistance,
} from './services/location/distanceCoordinate';

import Navigator from './navigations';
import database from '@react-native-firebase/database';

import {StorageGet} from './services/deviceStorage';
import packageJson from '../package.json';
import config from './config';

type AppProps = {
  userAuth: any;
  onSetUpdate: Function;
  onPipAndroid: Function;
};

function App({userAuth, onSetUpdate}: AppProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [distanceOrder, setDistanceOrder]: any = useState({
    total: null,
    deliveryCoord: false,
    loading: false,
    count: 30,
    order: null,
    raceValue: 0, // Valor da Corrida default
  });

  const TextConfig: any = Text;
  const TextInpuConfig: any = TextInput;

  TextConfig.defaultProps = TextConfig.defaultProps || {}; // Ignore dynamic type scaling on iOS
  TextConfig.defaultProps.allowFontScaling = false;

  TextInpuConfig.defaultProps = TextInpuConfig.defaultProps || {}; // Ignore dynamic type scaling on iOS
  TextInpuConfig.defaultProps.allowFontScaling = false;

  PushNotification.configure({
    onNotification: function (notification: any) {
      const title: string = notification?.title || 'Toop Delivery';

      const payload: PushNotificationObject = {
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
      };

      PushNotification.localNotification(payload);
    },
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    popInitialNotification: true,
    requestPermissions: true,
  });

  const [connState, setConnState] = useState<NetInfoState>();

  useEffect(() => {
    NetInfo.fetch().then((state: NetInfoState) => {
      setConnState(state);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setConnState(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (userAuth && userAuth.user) {
      watchPosition(userAuth.user);
    }

    return () => {
      cleanMonitorLocation();
    };
  }, [userAuth?.user]);

  useEffect(() => {
    const getTokenUpdateDelivery = async () => {
      const token = await messaging().getToken();

      await updateDeliveryMan(userAuth?.user?.deliveryMan?._id, {
        token,
        appVersion: packageJson.version,
      });
    };

    if (userAuth && userAuth.user) {
      getTokenUpdateDelivery();
    }
  }, [userAuth?.user]);

  useEffect(() => {
    if (
      userAuth?.user &&
      userAuth?.user?.person &&
      userAuth?.user?.person?._id
    ) {
      const url =
        `${config.FIREBASE_PATH}new/order/person=${userAuth.user.person._id}`.trim();
      database()
        .ref(url)
        .on('value', (snapshot) => {
          const itens = snapshot.val();
          if (itens) {
            const {orderId, raceValue = 0} = itens;
            if (orderId) {
              getOrderWaitDelivertman(orderId, raceValue, itens);
            }
          }
        });
    }
  }, [userAuth?.user?.person?._id]);

  const acceptOrderDelivery = async () => {
    const orderId = distanceOrder.order.orderId;
    let nowDate = getDateAndCloseModal();

    let upStatus = await updateStatusOrder(distanceOrder.order.orderId, {
      acceptedDateDeliveryMan: nowDate,
      deliveryMan: userAuth.user.deliveryMan._id,
      status: 'ACCEPT_DELIVERYMAN',
    });

    removeReference();
    setModalVisible(false);

    // Validar quando pedido já foi aceito ou não foi possível atualizar
    if (!upStatus || upStatus === null) {
      Alert.alert('Novo Pedido', 'Pedido já foi aceito ...');
      return;
    }

    const oneOrder = await listOrderOne(orderId);
    createHistoryRace('ACCEPTED');
    onSetUpdate(oneOrder); // dispara para redirecionar para order
  };

  const rejectOrderDelivery = async () => {
    createHistoryRace('REFUSED');
  };

  const createHistoryRace = async (statusRace: string) => {
    let respLocation = await locationDelivery(userAuth.user);
    newRaceHistory({
      deliveryMan: userAuth.user._id,
      order: distanceOrder.order?._id,
      statusRace,
      latitude: respLocation?.latitude,
      longitude: respLocation?.longitude,
    });
  };

  const getDateAndCloseModal = () => {
    let nowDate = new Date(Date.now());
    return nowDate;
  };

  const getOrderWaitDelivertman = async (
    orderId: string,
    raceValue: number | undefined,
    notify: any,
  ) => {
    try {
      let userStorage = await StorageGet(config.tokenAuth); // Quando em Background redux não existe ainda

      setDistanceOrder({
        total: null,
        deliveryCoord: false,
        loading: true,
        count: distanceOrder.count,
        order: null,
        raceValue:
          raceValue && raceValue > 0 ? raceValue : distanceOrder.raceValue,
      });

      setModalVisible(true);

      if (userStorage && userStorage.user && userStorage.user.deliveryMan) {
        notificationReceived(orderId, {
          deliveryMan: userStorage.user.deliveryMan?._id,
        });
      }

      // StorageMultClean(['@orderId', '@raceValue']);

      if (userStorage && userStorage.user) {
        let respLocation = {
          latitude: notify.deliverymanLatitude,
          longitude: notify.deliverymanLongitude,
        };

        let distance: any = distanceLatLonInKm(respLocation, {
          latitude: notify.companyLatitude,
          longitude: notify.companyLongitude,
        });

        let distanceUser: any = distanceLatLonInKm(
          {
            latitude: notify.customerLatitude,
            longitude: notify.customerLongitude,
          },
          {
            latitude: notify.companyLatitude,
            longitude: notify.deliverymanLongitude,
          },
        );

        if (distance !== '') {
          try {
            let totalDist = formatDistance(distance + distanceUser);
            setDistanceOrder({
              total: totalDist,
              deliveryCoord: respLocation,
              loading: false,
              count:
                notify.waitingTime > 0
                  ? notify.waitingTime
                  : distanceOrder.count,
              order: notify,
              raceValue:
                raceValue && raceValue > 0
                  ? raceValue
                  : distanceOrder.raceValue,
            });
          } catch (e) {
            // console.log('Fail in setDistanceOrder', e);
          }
        }
      } else {
        setDistanceOrder({
          total: null,
          deliveryCoord: false,
          loading: false,
          count: distanceOrder.count,
          order: null,
          raceValue: distanceOrder.raceValue,
        });
        setModalVisible(false);
      }
    } catch (err) {
      setModalVisible(false);
      setDistanceOrder({
        total: null,
        deliveryCoord: false,
        loading: false,
        count: distanceOrder.count,
        order: null,
        raceValue: distanceOrder.raceValue,
      });
      console.log('Opps Fail', err);
    }
  };

  const removeReference = () => {
    try {
      database()
        .ref(
          `${config.FIREBASE_PATH}new/order/person=${userAuth.user.person._id}`,
        )
        .remove();
    } catch (err) {
      //
    }
  };

  return (
    <>
      <StatusBar
        translucent
        barStyle="light-content"
        backgroundColor="transparent"
      />

      <Navigator />

      <Modal
        animationType="fade"
        transparent={true}
        // onShow={() => setCount(20)}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <NewOrder
          closeModal={setModalVisible}
          distanceOrder={distanceOrder}
          acceptOrderDelivery={() => {
            acceptOrderDelivery();
          }}
          rejectOrderDelivery={rejectOrderDelivery}
        />
      </Modal>

      <Modal
        animated={true}
        animationType="slide"
        transparent={true}
        visible={!connState?.isInternetReachable}
        onRequestClose={() => {}}>
        <IsNotConnected />
      </Modal>
    </>
  );
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSetUpdate: (order: any) =>
      dispatch({
        type: 'SET_UPDATE_ORDER',
        payload: {update: true, order: order},
      }),
    onPipAndroid: (active: boolean) =>
      dispatch({
        type: 'SET_PIP_ANDROID_UPDATE',
        payload: active,
      }),
  };
};

const mapStateToProps = ({authUser}: any) => {
  return {
    userAuth: authUser,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
