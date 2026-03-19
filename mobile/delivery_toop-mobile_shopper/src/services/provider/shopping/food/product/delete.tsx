import api from '../../../../api';
import ErrorAxios, {ErrorMessageServer} from '../../../errorAxios';

const deleteProduct = async (company: string, _id: string) => {
  try {
    const response = await api.delete(`/food/product/${_id}`, {
      headers: {
        Company: company,
      },
    });
    const data = response.data;
    return true;
  } catch (err) {
    ErrorAxios(err, 'Error deleteProduct');
    return ErrorMessageServer(err);
  }
};

export {deleteProduct};
