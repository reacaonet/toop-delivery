import api from '../../../api';
import ErrorAxios, { ErrorMessageServer } from '../../errorAxios';

export const orderUpdateStatus = async (orderId: string, params: {}) => {
  try {
    const response = await api.put(`/order/status/${orderId}`, params);
    const data = response.data;

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error Update');
    return ErrorMessageServer(err);
  }
};

export const cancelPayment = async (orderId: string, params = {}) => {
  try {
    const response = await api.put(`/payment/cancel/order/${orderId}`, params);
    const data = response.data;

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error cancelPayment');
    return ErrorMessageServer(err);
  }
};
