import api from '../../../api';
import ErrorAxios, {ErrorMessageServer} from '../../errorAxios';

const updateItemCheck = async (shopper: string, params: {}) => {
  try {
    const response = await api.put(
      `/shopping/cart-item/shopper/${shopper}`,
      params,
    );
    const data = response.data;

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error updateItemCheck');
    return ErrorMessageServer(err);
  }
};

export {updateItemCheck};
