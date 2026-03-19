import api, { ErrorMessageServer } from '../../api';

export const completeRace = async (params: any) => {
  try {
    const { data: response } = await api.put(
      '/v1/mobility/booking/complete',
      params,
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
