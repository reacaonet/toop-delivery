import api from '../../api';

export const changeRouteBooking = async (params: any): Promise<any> => {
  try {
    const {data: response} = await api.put(
      '/v1/mobility/booking/change-route',
      params,
    );

    if (!response) {
      return {
        errMessage: 'Não conseguimos concluir sua solicitação',
      };
    }

    return response;
  } catch (err: any) {
    let errMessage: string = 'Não conseguimos concluir sua solicitação';

    if (err.response && err.response.data) {
      if (err.response.data.message) {
        errMessage = err.response.data.message;
      }
    }

    return {
      errMessage: errMessage,
    };
  }
};
