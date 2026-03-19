import api from '../../api';
import {queryString} from '../../../utils';

export const listSliders = async (params = {}): Promise<any> => {
  try {
    const getQuery = queryString(params);

    const {data: response} = await api.get(
      `/v1/mobility/slider/list?${getQuery}`,
    );

    return response;
  } catch (err) {
    console.log('fail listSliders', err);
    return null;
  }
};
