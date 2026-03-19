import api from '../../api';
import { queryString } from '../../../utils';
import ErrorAxios from '../errorAxios';

const listChat = async (params: {}) => {
  try {
    const getQuery = queryString(params);
    const response = await api.get(`/chat?${getQuery}`);
    const data = response.data;
    return data;
  } catch (err) {
    return ErrorAxios(err, 'Error listChat');
  }
};

const totalNoRead = async (cartId: string, params: any) => {
  try {
    const getQuery = queryString(params);
    const response = await api.get(
      `/chat/message/total/no-read/${cartId}?${getQuery}`,
    );
    const data = response.data;
    return data;
  } catch (err) {
    if (err.response && err.response.data) {
      console.log('Fail totalNoRead', err.response.data);
    } else {
      console.log('Fail totalNoRead', err);
    }

    return null;
  }
};

export { listChat, totalNoRead };
