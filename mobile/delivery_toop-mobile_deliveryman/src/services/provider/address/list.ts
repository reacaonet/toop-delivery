import api from '../../api';
import {queryString} from '../../../utils';

const listState = async (params: any = {}) => {
  try {
    const query = queryString(params);

    const response = await api.get(`/setting/state?${query}`);
    const data = response.data;

    return data;
  } catch (err) {
    console.log('Fail listState', err);
    return [];
  }
};

const listCity = async (params: any = {}) => {
  try {
    const query = queryString(params);

    const response = await api.get(`/setting/city?${query}`);
    const data = response.data;

    return data;
  } catch (err) {
    console.log('Fail listState', err);
    return [];
  }
};

export {listState, listCity};
