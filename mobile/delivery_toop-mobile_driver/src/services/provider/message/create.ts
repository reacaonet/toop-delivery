import api, { ErrorMessageServer } from '../../api';

export const crateMessage = async (params: any): Promise<any> => {
  try {
    const { data: response } = await api.post('/v1/mobility/message', params);

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
