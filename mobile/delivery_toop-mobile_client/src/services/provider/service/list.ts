import api from '../../api';
import {queryString} from '../../../utils';

export const listServices = async (params: any): Promise<any> => {
  try {
    const getQuery = queryString(params);

    // console.log('listServices', `/v1/mobility/services/available?${getQuery}`);

    const {data: response} = await api.get(
      `/v1/mobility/services/available?${getQuery}`,
    );

    return response;
  } catch (err) {
    console.log('fail listServices', err);
    return null;
  }
};
