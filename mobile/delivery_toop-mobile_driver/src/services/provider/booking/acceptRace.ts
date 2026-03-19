import api, { ErrorMessageServer } from '../../api';

export const acceptRace = async (params: any) => {
  try {
    console.log('/v1/mobility/driver/accept-race', params);

    const { data: response } = await api.post(
      '/v1/mobility/driver/accept-race',
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
