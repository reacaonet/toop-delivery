import api from '../../api';
import {queryString} from '../../../utils';

const listOne = async (company_id: any) => {
  try {
    const response = await api.get(`company/${company_id}`);
    const data = response.data;

    return data;
  } catch (err) {
    console.log('Fail ListOne Company', err);
    return null;
  }
};

const listDeliveryOne = async (company_id: any) => {
  try {
    const response = await api.get(`/company/company-delivery/${company_id}`);
    const data = response.data;

    if (data.length > 0) return data[0];
    return data;
  } catch (err) {
    console.log('Fail ListOne Company', err);
    return null;
  }
};
export {listOne, listDeliveryOne};
