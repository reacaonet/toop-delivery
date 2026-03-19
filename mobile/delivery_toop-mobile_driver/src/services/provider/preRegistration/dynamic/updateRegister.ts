import api, { ErrorMessageServer } from '../../../api';

export const updatePreRegistration = async (
  id: string,
  payload: any,
): Promise<any> => {
  try {
    const { data: response } = await api.post(
      `/pre-register/dynamic-record/${id}`,
      payload,
    );

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
