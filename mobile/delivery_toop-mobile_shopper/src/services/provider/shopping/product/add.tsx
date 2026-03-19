import api from '../../../api';
import ErrorAxios, {ErrorMessageServer} from '../../errorAxios';

const addProductItem = async (params: {}) => {
  try {
    const response = await api.post('/product/register', params);
    const data = response.data;
    if (data && data.data) {
      return data.data;
    }

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error addProductItem');
    return ErrorMessageServer(err);
  }
};

const createProduct = async (company: string, body: {}) => {
  try {
    const response = await api.post('/product/create', body, {
      headers: {
        Company: company,
      },
    });
    const data = response.data;
    if (data && data.data) {
      return data.data;
    }

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error addProductItem');
    return ErrorMessageServer(err);
  }
};

export {addProductItem, createProduct};
