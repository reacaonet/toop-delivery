import api, { ErrorMessageServer } from '../../api';

export const createPreRegistration = async (
  ddi: string,
  phone: string,
): Promise<any> => {
  try {
    const { data: response } = await api.post('/pre-register', {
      ddi,
      phone,
    });

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
