import api from '../../../api';
import ErrorAxios, {ErrorMessageServer} from '../../errorAxios';

const deleteCategory = async (company: string, _id: string) => {
  try {
    const response = await api.delete(`/food/category/${_id}`, {
      headers: {
        Company: company,
      },
    });

    const data = response.data;

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error deleteCategory');
    return ErrorMessageServer(err);
  }
};

export {deleteCategory};
