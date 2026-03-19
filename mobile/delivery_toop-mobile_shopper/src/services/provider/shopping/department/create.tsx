import api from '../../../api';
import ErrorAxios, {ErrorMessageServer} from '../../errorAxios';

const createDepartment = async (body: any) => {
  try {
    const response = await api.post(`/shopping/department`, body);

    const data = response.data;

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error createDepartment');
    return ErrorMessageServer(err);
  }
};

export {createDepartment};
