import api, { ErrorMessageServer } from '../../api';

export const cancelBooking = async (bookingId: string, params: any) => {
  try {
    const { data: response } = await api.put(
      `/v1/mobility/booking/driver-cancel/${bookingId}`,
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

export const refusedBooking = async (bookingId: string, driverId: string) => {
  try {
    const { data: response } = await api.get(
      `/v1/mobility/booking/refused?booking=${bookingId}&driver=${driverId}`,
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
