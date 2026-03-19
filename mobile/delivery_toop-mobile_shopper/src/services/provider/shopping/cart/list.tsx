import api from '../../../api';
import {queryString} from '../../../../utils';
import ErrorAxios from '../../errorAxios';

const cartCustomer = async (cartId: string, params: any) => {
  try {
    const getQuery = queryString(params);
    const response = await api.get(
      `shopping/cart/current/${cartId}?${getQuery}`,
    );
    const data = response.data;
    return data;
  } catch (err) {
    return ErrorAxios(err, 'Error cartCurrent');
  }
};

export default cartCustomer;
