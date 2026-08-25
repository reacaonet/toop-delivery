/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FlatList, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import database from '@react-native-firebase/database';
import {
  styles,
  Container,
  Touch,
  TextTouch,
  TouchCancel,
  TextTouchCancel,
} from './styles';
import Progress from './progressList';

/** Service */
import { listOrderOne } from '../../../../services/provider/shopping/order';
import getCustomer from '../../../../services/provider/person/customer';
import { orderUpdateStatus } from '../../../../services/provider/shopping/order';
import { totalNoRead } from '../../../../services/provider/chat';

import {
  getIsDispatch,
  getOnlineDelivery,
} from '../../../../services/provider/shopping/order';

import config from '../../../../config';

const ProgressView: React.FC = () => {
  const navigation = useNavigation();
  const {
    authUser: { user = null },
  }: any = useSelector((state) => state);
  const route = useRoute<any>();

  const [order, setOrder] = useState<any>();
  const [customer, setCustomer]: any = useState({});
  const [btnProcess, setBtnProcess] = useState(false);
  const [totalMessage, setTotalMessage] = useState(0);
  const [isDispatch, setIsDispatch] = useState(false);
  const [isOnlineDelivery, setIsOnlineDelivery] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.order && route.params?.order?._id) {
        orderRequest();

        getIsDispatch(route.params?.order?._id, {}).then((result) => {
          if (result?.response?.companyDelivery?.own_delivery === true) {
            setIsDispatch(true);
          } else {
            setIsDispatch(false);
          }
        });

        getOnlineDelivery(route.params?.order?._id, {}).then((result) => {
          console.log('result', result);

          if (result?.response?.companyDelivery?.online_delivery === true) {
            setIsOnlineDelivery(true);
          } else {
            setIsOnlineDelivery(false);
          }
        });
      }
    }, [route.params?.order]),
  );

  useFocusEffect(
    useCallback(() => {
      if (order && order?._id) {
        database()
          .ref(`${config.FIREBASE_PATH}order/${order?._id}`)
          .on('child_changed', (snapshot) => {
            if (snapshot.val()) {
              console.log('Atualizando ....');
              orderRequest();
            }
          });

        // temp
        getTotalNoRead();

        if (order?.company && order?.company?._id) {
          database()
            .ref(`${config.FIREBASE_PATH}chat/company/${order?.company?._id}`)
            .on('value', (snapshot: any) => {
              if (snapshot.val()) {
                getTotalNoRead();
              }
            });
        }

        if (order?.shoppingCart) {
          database()
            .ref(`${config.FIREBASE_PATH}chat/cart/${order?.shoppingCar}`)
            .on('value', (snapshot: any) => {
              if (snapshot.val()) {
                getTotalNoRead();
              }
            });
        }
      }

      return () => {
        database().ref(`${config.FIREBASE_PATH}order/${order?._id}`).off();
        database()
          .ref(`${config.FIREBASE_PATH}chat/company/${order?.company?.id}`)
          .off();
        database()
          .ref(`${config.FIREBASE_PATH}chat/cart/${order?.shoppingCart}`)
          .off();
      };
    }, [order?._id]),
  );

  const orderRequest = async () => {
    let resp = await listOrderOne(route.params?.order?._id, {});

    setOrder(resp);

    if (resp && resp.customer) {
      let respCustomer = await getCustomer(resp.customer._id);

      if (route.params?.order?.customerDelivery) {
        respCustomer.customerDelivery = route.params?.order?.customerDelivery;
      }

      setCustomer(respCustomer);
    }
  };

  const chageStatus = async (status: string) => {
    setBtnProcess(true);
    const resp: any = await orderUpdateStatus(order._id, {
      status,
    });
    setBtnProcess(false);

    if (resp && resp.errMessage) {
      setBtnProcess(false);
      Alert.alert('Opps', resp.errMessage);
      return;
    }

    if (status === 'FINISHED') {
      return navigation.navigate('Orders');
    }

    orderRequest();
  };

  const getTotalNoRead = async () => {
    try {
      if (order && order?.shoppingCart && user && user?.person?._id) {
        let respTotal = await totalNoRead(order?.shoppingCart, {
          personId: user?.person?._id,
        });

        if (respTotal && respTotal.total >= 0) {
          setTotalMessage(respTotal.total);
        }
      }
    } catch (err) { }
  };

  // console.log('order.status', order?.status);
  // console.log('order?.typeSchedule', order?.typeSchedule);
  // console.log('isOnlineDelivery', isOnlineDelivery);

  return (
    <Container>
      <FlatList
        data={[{ title: 'Title Text', key: 'item1', id: 1 }]}
        keyExtractor={(item: any) => `${item.id}`}
        style={styles.flatStyle}
        renderItem={() => (
          <Progress
            order={order}
            customer={customer}
            totalMessage={totalMessage}
          />
        )}
      />

      {isOnlineDelivery === true &&
        order &&
        order.status === 'IN_PREPARATION' &&
        order?.typeSchedule === 'DELIVERY' ? (
        <Touch
          disabled={btnProcess}
          onPress={() => chageStatus('WAIT_DELIVERYMAN')}>
          <TextTouch>
            {!btnProcess ? 'Liberar para entrega Gojá' : 'Aguarde ...'}
          </TextTouch>
        </Touch>
      ) : null}

      {isDispatch === false &&
        order &&
        order.status === 'IN_PREPARATION' &&
        order?.typeSchedule === 'WITHDRAWAL' ? (
        <Touch disabled={btnProcess} onPress={() => chageStatus('FINISHED')}>
          <TextTouch>
            {!btnProcess ? 'Cliente já retirou? ' : 'Aguarde ...'}
          </TextTouch>
        </Touch>
      ) : null}

      {isDispatch === true &&
        order &&
        order.status === 'IN_PREPARATION' &&
        order?.typeSchedule === 'DELIVERY' ? (
        <Touch disabled={btnProcess} onPress={() => chageStatus('DISPATCH')}>
          <TextTouch>{!btnProcess ? 'Despachar' : 'Aguarde ...'}</TextTouch>
        </Touch>
      ) : null}

      {isDispatch === true &&
        order &&
        order.status === 'IN_PREPARATION' &&
        order?.typeSchedule === 'WITHDRAWAL' ? (
        <Touch disabled={btnProcess} onPress={() => chageStatus('FINISHED')}>
          <TextTouch>
            {!btnProcess ? 'Cliente já retirou ' : 'Aguarde ...'}
          </TextTouch>
        </Touch>
      ) : null}

      {order && order.status === 'WAIT_DELIVERYMAN' ? (
        <>
          <Touch colorDisable disabled={true}>
            <TextTouch>Procurando Entregador ...</TextTouch>
          </Touch>
          <TouchCancel
            disabled={btnProcess}
            onPress={() => chageStatus('IN_PREPARATION')}>
            <TextTouchCancel>
              {!btnProcess ? 'Cancelar' : 'Cancelando...'}
            </TextTouchCancel>
          </TouchCancel>
        </>
      ) : null}

      {order && order.status === 'ACCEPT_DELIVERYMAN' ? (
        <Touch
          disabled={btnProcess}
          onPress={() => chageStatus('RELEASE_SHOPPER')}>
          <TextTouch>Liberar Entrega</TextTouch>
        </Touch>
      ) : null}

      {order && order.status === 'DISPATCH' ? (
        <Touch disabled={btnProcess} onPress={() => chageStatus('FINISHED')}>
          <TextTouch>Concluir Entrega Própria</TextTouch>
        </Touch>
      ) : null}
    </Container>
  );
};

export default ProgressView;
