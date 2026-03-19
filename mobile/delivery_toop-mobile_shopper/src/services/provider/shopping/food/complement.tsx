import api from '../../../api';
import ErrorAxios, {ErrorMessageServer} from '../../errorAxios';

const listComplement = async (idProduct: string) => {
  try {
    const response = await api.get(`food/product-complement/${idProduct}`);

    const data = response.data;
    if (data && data.data) {
      return data.data;
    }

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error ListComplement');
    return ErrorMessageServer(err);
  }
};

const cartItemComplement = async (cartItem: string) => {
  try {
    const response = await api.get(
      `food/product-complement/cartItem/${cartItem}`,
    );

    const data = response.data;
    if (data && data.data) {
      return data.data;
    }

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error ListComplement');
    return ErrorMessageServer(err);
  }
};

export {listComplement, cartItemComplement};
