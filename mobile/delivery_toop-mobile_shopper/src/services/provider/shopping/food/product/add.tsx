import api from '../../../../api';
import ErrorAxios, {ErrorMessageServer} from '../../../errorAxios';

const createProduct = async (company: string, params: {}) => {
  try {
    const response = await api.post('/food/product', params, {
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

export {createProduct};
