import api, { ErrorMessageServer } from '../../api';

export const updateDriver = async (
  driverId: string,
  params: any,
): Promise<any> => {
  try {
    const { data: response } = await api.put(
      `/v1/mobility/driver/${driverId}`,
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
