import api, { ErrorAxios, ErrorMessageServer } from '../../api';
import { queryString } from '../../../utils';

export const getBalance = async (params: any) => {
  try {
    console.log('getBalance', `/v2/wallet/balance?${queryString(params)}`);

    const { data: response } = await api.get(
      `/v2/wallet/balance?${queryString(params)}`,
    );
    return response;
  } catch (err) {
    ErrorAxios(err, 'Fail get balance');
    return ErrorMessageServer(err);
  }
};
