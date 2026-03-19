import api from '../../api';
import {queryString} from '../../../utils';

export const listActiveRun = async (
  passengerId: string,
  params: any = {},
): Promise<any> => {
  try {
    const getQuery = queryString(params);

    const {data: response} = await api.get(
      `/v1/mobility/passengers/active-run/${passengerId}?${getQuery}`,
    );

    return response;
  } catch (err) {
    console.log('fail listActiveRun', err);
    return null;
  }
};
