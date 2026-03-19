import api from '../../api';
import { queryString } from '../../../utils';

export const listAssociatedBrands = async (params: any = {}) => {
  try {
    const getQuery = queryString(params);

    const { data: response } = await api.get(
      `/v1/mobility/associate-brands?${getQuery}`,
    );

    return response;
  } catch (err) {
    console.log('fail listPassengerOne', err);
    return null;
  }
};
