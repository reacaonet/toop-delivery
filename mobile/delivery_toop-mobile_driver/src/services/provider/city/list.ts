import api from '../../api';
import { queryString } from '../../../utils';

export const listCities = async (params: any): Promise<any> => {
  try {
    const getQuery = queryString(params);

    const { data: response } = await api.get(`/setting/city?${getQuery}`);

    return response;
  } catch (err) {
    console.log('fail listCities', err);
    return null;
  }
};
