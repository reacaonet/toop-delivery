import api, { ErrorMessageServer } from '../../api';

export const cancelBooking = async (
  bookingId: string,
  params: any,
): Promise<any> => {
  try {
    const { data: response } = await api.put(
      `/v1/mobility/booking/passenger-cancel/${bookingId}`,
      params,
    );

    if (!response) {
      return {
        errMessage: 'Não conseguimos concluir sua solicitação',
      };
    }

    return response;
  } catch (err: any) {
    console.log('err', err);
    return ErrorMessageServer(err);
  }
};
