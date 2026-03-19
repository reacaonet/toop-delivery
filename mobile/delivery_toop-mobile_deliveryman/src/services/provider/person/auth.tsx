import api from '../../api';
import ErrorAxios from '../errorAxios';

const auth = async (email: string, password: string, type: string) => {
  try {
    const response = await api.post('/user/auth', {
      email,
      password,
      type,
    });

    const data = response.data;
    if (!data || !data.token || !data.user || !data.user.email) {
      return false;
    }

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error Auth Delivery');
    return false;
  }
};

export default auth;
