import api from '../../api';
import { queryString } from '../../../utils';

export const driverBalance = async (driverId: string, params = {}) => {
  try {
    const getQuery = queryString(params);

    const { data: response } = await api.get(
      `/v1/mobility/extract/${driverId}?${getQuery}`,
    );

    if (!response) {
      return {
        errMessage: 'Não conseguimos concluir sua solicitação',
      };
    }

    return response;
  } catch (err) {
    return null;
  }
};
