import api from '../../../../api';
import ErrorAxios, {ErrorMessageServer} from '../../../errorAxios';

const updateProduct = async (company: string, _id: string, body: {}) => {
  try {
    const response = await api.put(`/food/product/${_id}`, body, {
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
    ErrorAxios(err, 'Error updateProduct');
    return ErrorMessageServer(err);
  }
};
const updateStatusProduct = async (company: string, _id: string, body: {}) => {
  try {
    const response = await api.put(`/food/product/${_id}/status`, body, {
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

export {updateProduct, updateStatusProduct};
