import api from '../../api';
import ErrorAxios, {ErrorMessageServer} from '../errorAxios';

const createLog = async (params: {}) => {
  try {
    const response = await api.post('/log/create', params);
    const data = response.data;
    if (data && data.data) {
      return data.data;
    }

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error createLog');
    return ErrorMessageServer(err);
  }
};

export {createLog};
