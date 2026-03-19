import api from '../../../api';
import {createLog} from '../../../service/Log';

const createCart = async (customerId, companyId, post) => {
  try {
    const {data: response} = await api.post(
      `/shopping/cart/${customerId}/${companyId}`,
      post,
    );

    if (response && response.data) {
      return response.data;
    }

    return response;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.error) {
      return {status: false, error: err.response.data.error};
    }

    logError(err);
    return null;
  }
};

export const cartReorder = async (cartId, type) => {
  try {
    const {data: response} = await api.get(
      `shopping/cart/cart-reorder/${cartId}?type=${type}`,
    );

    return response;
  } catch (err) {
    console.log('err cartReorder', err);

    if (err.response && err.response.data && err.response.data.message) {
      return {
        status: false,
        message: err.response.data.message,
      };
    }

    return {
      status: false,
      message: 'Não foi possível realizar pedido',
    };
  }
};

const logError = err => {
  createLog({
    typeSystem: 'MOBILE',
    typeLog: 'ERROR',
    description: err,
    category: 'Create Cart',
    originError: 'services-service-shopping-cart-create',
  });
};

export {createCart};
