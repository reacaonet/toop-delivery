import api, { ErrorMessageServer } from '../../api';

export const updatePreRegistration = async (
  id: string,
  dados: Object,
): Promise<any> => {
  try {
    const { data: response } = await api.put(`/pre-register/${id}`, dados);

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
