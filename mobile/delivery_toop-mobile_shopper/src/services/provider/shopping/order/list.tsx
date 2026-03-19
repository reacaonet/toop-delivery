import api from '../../../api';
import { queryString } from '../../../../utils';
import ErrorAxios from '../../errorAxios';
import { OrderStatus } from './orderStatus';
import { AxiosResponse } from 'axios';
//import messaging from '@react-native-firebase/messaging';
//import notificationApi from '../../../notification';
//import isAuthenticated from '../../../../services/userAuth';

const listOrder: any = async (company: string, params: {}) => {
  try {
    const getQuery: string = queryString(params);

    // console.log('list', `/order/delivery/${company}?${getQuery}`);

    const response = await api.get(`/order/delivery/${company}?${getQuery}`);
    const data = response.data;

    if (data && data.length > 0) {
      // console.log('Payload recebido ', getQuery);
      // console.log('link listOrder', `/order/delivery/${company}?${getQuery}`);

      data.map((item: any) => {
        item.statusText = OrderStatus(item.status);
        return item;
      });
    }

    return data;
  } catch (err) {
    return ErrorAxios(err, 'Error ListOrder');
  }
};

const listOrderOne = async (orderId: string, params: Object) => {
  try {
    const getQuery: string = queryString(params);
    const response = await api.get(`/order/delivery/id/${orderId}?${getQuery}`);
    const data = response.data;

    if (data && data.status) {
      data.statusText = OrderStatus(data.status);
    }
    return data;
  } catch (err) {
    return ErrorAxios(err, 'Error listOrderOne');
  }
};

const listOrderPayment = async (payment: any) => {
  try {
    const response = await api.get(`/order/payment/${payment}`);
    const data = response.data;

    return data;
  } catch (err) {
    console.log('Fail List Order', err);
    return null;
  }
};

const getIsDispatch = async (orderId: string, params: {}) => {
  try {
    const getQuery: string = queryString(params);
    const response: AxiosResponse = await api.get(
      `/order/own-delivery/${orderId}?${getQuery}`,
    );

    const data = response.data;
    return data;
  } catch (err) {
    return ErrorAxios(err, 'Error getIsDispatch');
  }
};

const getOnlineDelivery = async (orderId: string, params: {}) => {
  try {
    const getQuery: string = queryString(params);
    const response: AxiosResponse = await api.get(
      `/order/online-delivery/${orderId}?${getQuery}`,
    );

    const data = response.data;
    return data;
  } catch (err) {
    return ErrorAxios(err, 'Error getOnlineDelivery');
  }
};

export {
  listOrder,
  listOrderOne,
  listOrderPayment,
  getIsDispatch,
  getOnlineDelivery,
};
