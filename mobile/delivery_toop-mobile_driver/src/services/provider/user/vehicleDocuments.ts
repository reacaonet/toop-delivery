import api, { ErrorMessageServer } from '../../api';
import { queryString } from '../../../utils';

export const listVehicleDocuments = async (
  driver: string,
  params = {},
): Promise<any> => {
  try {
    const getQuery = queryString(params);

    const { data: response } = await api.get(
      `/v1/mobility/vehicle-documents/${driver}?${getQuery}`,
    );

    return response;
  } catch (err: any) {
    return ErrorMessageServer(err);
  }
};

export const updateVehicleDocuments = async (id: string, params: any) => {
  try {
    const { data: response } = await api.put(
      `/v1/mobility/vehicle-documents/${id}`,
      params,
    );

    return response;
  } catch (err: any) {
    return ErrorMessageServer(err);
  }
};

export const createVehicleDocuments = async (params = {}) => {
  try {
    const { data: response } = await api.post(
      '/v1/mobility/vehicle-documents',
      params,
    );

    return response;
  } catch (err: any) {
    return ErrorMessageServer(err);
  }
};
