import api from '../../api';

export const ActiverRun = async (driverId: string) => {
  try {
    const { data: response } = await api.get(
      `/v1/mobility/driver/active-run/${driverId}`,
    );

    if (!response) {
      return {
        errMessage: 'Não conseguimos concluir sua solicitação',
      };
    }

    return response;
  } catch (err) {
    return null;
  }
};
