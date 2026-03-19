import api from '../../../api';
import ErrorAxios, {ErrorMessageServer} from '../../errorAxios';

const deleteProduct = async (_id: string) => {
  try {
    const response = await api.delete(`/product/delete/${_id}`);
    const data = response.data;
    return true;
  } catch (err) {
    ErrorAxios(err, 'Error addProductItem');
    return ErrorMessageServer(err);
  }
};

export {deleteProduct};
