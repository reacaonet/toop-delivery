import api, { ErrorMessageServer } from '../../../api';
import { queryString } from '../../../../utils';

export const listDynamicRegister = async (params: any): Promise<any> => {
  try {
    // ddi=${encodeURIComponent(ddi)}
    const getQuery = queryString(params);

    const { data: response } = await api.get(
      `/pre-register/dynamic?${getQuery}`,
    );

    return response;
  } catch (err) {
    ErrorMessageServer(err);
    return null;
  }
};
