import api from '../../api';
import ErrorAxios from '../errorAxios';

const updateDeliveryStatusOffline = async (id: string) => {
  try {
    const response = await api.put(`/delivery-man/offline/${id}`);
    const res = response.data;

    return res;
  } catch (err) {
    ErrorAxios(err, 'Fail Update Status Offline Delivery Man');
    return null;
  }
};

const createDeliveryStatusOnline = async (data: any) => {
  try {
    const response = await api.post('/delivery-man/online/', data);
    const res = response.data;

    return res;
  } catch (err) {
    ErrorAxios(err, 'Fail Create Status Online Delivery Man');
    return null;
  }
};

export {updateDeliveryStatusOffline, createDeliveryStatusOnline};
