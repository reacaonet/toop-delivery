import api from '../../../api';
import ErrorAxios, {ErrorMessageServer} from '../../errorAxios';

const deleteCartItem = async (shopper: string, itemId: string) => {
  try {
    const response = await api.delete(
      `/shopping/cart-item/shopper/${shopper}/item/${itemId}`,
    );

    const data = response.data;
    return data;
  } catch (err) {
    ErrorAxios(err, 'Error deleteCartItem');
    return ErrorMessageServer(err);
  }
};

export {deleteCartItem};
