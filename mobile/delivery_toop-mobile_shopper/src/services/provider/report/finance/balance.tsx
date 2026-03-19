import api from '../../../api';
import {queryString} from '../../../../utils';

const listBalance = async (params: any) => {
  try {
    const getQuery = queryString(params);
    const response = await api.get(
      `/finance/balances/company/balance/?${getQuery}`,
    );
    const data = response.data;
    return data;
  } catch (err) {
    console.log('Fail listBalance', err.response.data);
    return null;
  }
};

const listBalancePaginate = async (params: any) => {
  try {
    const getQuery = queryString(params);
    const response = await api.get(
      `/finance/balances/company/paginator?${getQuery}`,
    );
    const data = response.data;
    return data;
  } catch (err) {
    console.log('Fail listBalancePaginate', err.response.data);
    return null;
  }
};

export {listBalance, listBalancePaginate};
