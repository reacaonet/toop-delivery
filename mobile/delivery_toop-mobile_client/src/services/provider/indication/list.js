import api from '../../api';
import {queryString} from '../../../utils';

export const listIndications = async params => {
  try {
    const getQuery = queryString(params);

    const {data: response} = await api.get(`/mobility/indication?${getQuery}`);

    return response;
  } catch (err) {
    console.log('fail listIndications', err);
    return null;
  }
};
