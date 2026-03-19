import api from '../../../api';
import {queryString} from '../../../../utils';
import ErrorAxios from '../../errorAxios';

const listCartItem = async (cartId: string, params: {}) => {
  try {
    const getQuery: string = queryString(params);
    const response = await api.get(`/shopping/cart-item/${cartId}?${getQuery}`);
    console.log(`/shopping/cart-item/${cartId}?${getQuery}`);
    const data = response.data;
    return data;
  } catch (err) {
    return ErrorAxios(err, 'Error listCartItem');
  }
};

export {listCartItem};
