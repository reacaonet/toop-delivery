import api from '../../../api';
import ErrorAxios, {ErrorMessageServer} from '../../errorAxios';

const deleteDepartment = async (_id: string) => {
  try {
    const response = await api.delete(`/shopping/department/${_id}`);

    const data = response.data;

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error deleteDepartment');
    return ErrorMessageServer(err);
  }
};

export {deleteDepartment};
