import api, { ErrorMessageServer } from '../../api';
import { queryString } from '../../../utils';

export const listFranchise = async (params: any): Promise<any> => {
  try {
    const getQuery = queryString(params);

    const { data } = await api.get(`/franchises/list?${getQuery}`);

    if (!data) {
      console.log('Não conseguimos buscar pre cadastro');
      return {};
    }
    return data;
  } catch (err) {
    return ErrorMessageServer(err);
  }
};
