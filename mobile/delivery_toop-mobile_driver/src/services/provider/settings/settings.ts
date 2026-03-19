import api, { ErrorMessageServer } from '../../api';
import { queryString } from '../../../utils';

export const listSettings = async (
  franchiseId: string,
  params: any = {},
): Promise<any> => {
  try {
    const getQuery = queryString(params);

    const { data: request } = await api.get(
      `/setting/app/${franchiseId}?${getQuery}`,
    );

    return request;
  } catch (err) {
    return null;
  }
};
