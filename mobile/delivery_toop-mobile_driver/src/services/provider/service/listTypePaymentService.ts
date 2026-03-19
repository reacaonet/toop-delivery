import api, { ErrorMessageServer } from '../../api';
import { queryString } from '../../../utils';

export const listTypesServices = async (parmas = {}): Promise<any> => {
  try {
    const getQuery = queryString(parmas);

    const { data: response } = await api.get(
      `/v1/mobility/type-payment-service?${getQuery}`,
    );

    return response;
  } catch (err) {
    return null;
  }
};
