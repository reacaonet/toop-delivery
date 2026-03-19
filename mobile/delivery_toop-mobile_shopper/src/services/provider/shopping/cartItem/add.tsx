import api from '../../../api';
import ErrorAxios, {ErrorMessageServer} from '../../errorAxios';

const addCartItem = async (cart: string, product: string, params: {}) => {
  try {
    const response = await api.post(
      `/shopping/cart-item/${cart}/${product}`,
      params,
    );
    const data = response.data;
    if (data && data.data) {
      return data.data;
    }

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error addCartItem');
    return ErrorMessageServer(err);
  }
};

export {addCartItem};
