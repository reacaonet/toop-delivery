import api from '../../api';
import ErrorAxios, {ErrorMessageServer} from '../errorAxios';

const chatMessage = async (params: {}) => {
  try {
    const response = await api.post('/chat', params);
    const data = response.data;

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error Message');
    return ErrorMessageServer(err);
  }
};

export default chatMessage;
