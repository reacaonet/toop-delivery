import api, { ErrorMessageServer } from '../../api';

export const generateResetPassword = async (params: any) => {
  try {
    const { data: response } = await api.post('/user/reset/password', params);

    if (!response) {
      return {
        errMessage: 'Não conseguimos concluir sua solicitação',
      };
    }

    return response;
  } catch (err) {
    return ErrorMessageServer(err);
  }
};

export const resetPassword = async (params: any) => {
  try {
    const { data: response } = await api.put('/user/reset/password', params);

    if (!response) {
      return {
        errMessage: 'Não conseguimos concluir sua solicitação',
      };
    }

    return response;
  } catch (err) {
    return ErrorMessageServer(err);
  }
};
