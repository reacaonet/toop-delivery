import api, { ErrorMessageServer } from '../../api';

export const createEvaluation = async (params: any): Promise<any> => {
  try {
    const { data: response } = await api.post(
      '/v1/mobility/evaluation',
      params,
    );

    if (!response) {
      return {
        errMessage: 'Não conseguimos concluir sua solicitação',
      };
    }

    return response;
  } catch (err: any) {
    return ErrorMessageServer(err);
  }
};
