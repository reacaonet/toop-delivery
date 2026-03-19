import api from '../../api';
import {queryString} from '../../../utils';

export const cashBackCustomer = async (customer, params = {}) => {
  try {
    const getQuery = queryString(params);
    const response = await api.get(
      `/cashback/customer/${customer}?${getQuery}`,
    );
    const data = response.data;

    return data;
  } catch (err) {
    console.log('Fail Filter List', err);
    return null;
  }
};

export const cashBackMouthTotal = async (customer, params = {}) => {
  try {
    const getQuery = queryString(params);
    const response = await api.get(
      `/cashback/customer/month/total/${customer}?${getQuery}`,
    );
    const data = response.data;

    return data;
  } catch (err) {
    console.log('Fail Filter List', err);
    return null;
  }
};

export const cashBackBalance = async customer => {
  try {
    const response = await api.get(`/cashback/customer/balance/${customer}`);
    const data = response.data;

    return data;
  } catch (err) {
    console.log('Fail Filter balance', err);
    return null;
  }
};
