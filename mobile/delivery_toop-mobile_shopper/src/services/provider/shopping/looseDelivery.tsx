import api from '../../api';
import { queryString } from '../../../utils';
import { ErrorMessageServer } from '../errorAxios';


export const loosePriceDelivery: any = async (company: string, params: {}) => {
  try {
    const getQuery: string = queryString(params);

    const { data: response } = await api.get(`/company/price-delivery/${company}?${getQuery}`);

    return response;
  } catch (err) {
    return ErrorMessageServer(err);
  }
};

export const googleSearchAddres: any = async (latitude: Number, longitude: Number) => {
  try {
    const { data: response } = await api.get(`/v2/loose-delivery/address?latitude=${latitude}&longitude=${longitude}`);

    return response;
  } catch (err) {
    return ErrorMessageServer(err);
  }
};

export const createDelivery: any = async (params: any) => {
  try {
    const { data: response } = await api.post('/v2/loose-delivery', params);

    return response;
  } catch (err) {
    return ErrorMessageServer(err);
  }
};
