import api, { ErrorMessageServer } from '../../api';

export const authLogin = async (params: any) => {
  try {
    const { data: response } = await api.post('/user/auth', params);
    return response;
  } catch (err) {
    return ErrorMessageServer(err);
  }
};
