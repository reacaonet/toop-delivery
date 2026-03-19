import api from '../../api';
import {queryString} from '../../../utils';

export const listContries = async (params: any = {}) => {
  try {
    const getQuery = queryString(params);

    const {data: response} = await api.get(`/setting/countries?${getQuery}`);

    return response;
  } catch (err) {
    return null;
  }
};
