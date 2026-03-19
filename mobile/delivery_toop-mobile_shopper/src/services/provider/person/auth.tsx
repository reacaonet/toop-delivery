import api from '../../api';
import ErrorAxios from '../errorAxios';

const auth = async (email: string, password: string, type: string) => {
  try {
    const response = await api.post('/user/auth', {
      email,
      password,
      type,
    });

    const data = response?.data;
    if (!data || !data.token || !data.user || !data.user.email) {
      return false;
    }

    return data;
  } catch (err: any) {
    ErrorAxios(err, 'Error Auth Shopper');

    return {error: true, message: err?.response?.data?.message ?? ''};
  }
};

export default auth;
