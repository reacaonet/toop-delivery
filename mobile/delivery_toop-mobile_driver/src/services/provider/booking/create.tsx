import api from '../../api';

export const createBooking = async (params: any): Promise<any> => {
  try {
    const { data: response } = await api.post(
      '/v1/mobility/booking/deliveryman',
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
