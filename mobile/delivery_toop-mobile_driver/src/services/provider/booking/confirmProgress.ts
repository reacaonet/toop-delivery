import api, { ErrorMessageServer } from '../../api';

export const confirmProgress = async (params: any) => {
  try {
    // console.log('/v1/mobility/booking/confirm-progress', params);

    const { data: response } = await api.put(
      '/v1/mobility/booking/confirm-progress',
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
