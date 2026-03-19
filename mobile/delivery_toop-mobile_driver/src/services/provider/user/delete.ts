import api, { ErrorMessageServer } from '../../api';

export const deleteDriver = async (driverId: string): Promise<any> => {
  try {
    const { data: response } = await api.delete(
      `/v1/mobility/drivers/${driverId}`,
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
