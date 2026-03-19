import api from '../../api';
import { queryString } from '../../../utils';
import ErrorAxios from '../errorAxios';

const listDeliveryMan = async (customerDelivery: any, params = {}) => {
  try {
    const getQuery = queryString(params);
    const response = await api.get(
      `/order/deliveryMan/${customerDelivery}?${getQuery}`,
    );
    const data = response.data;

    return data;
  } catch (err) {
    ErrorAxios(err, 'Fail List Delivery Man');
    return null;
  }
};

const listOrder = async (payment: any) => {
  try {
    const response = await api.get(`/order/payment/${payment}`);
    const data = response.data;

    return data;
  } catch (err) {
    console.log('Fail listOrder', err);
    return null;
  }
};

const listOrderOne = async (orderId: any) => {
  try {
    const response = await api.get(`/order/delivery/id/${orderId}`);
    const data = response.data;

    return data;
  } catch (err) {
    console.log('Fail listOrderOne', err);
    return null;
  }
};

export { listDeliveryMan, listOrder, listOrderOne };
