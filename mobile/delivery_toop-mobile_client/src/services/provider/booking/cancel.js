import api, {ErrorMessageServer} from '../../api';

export const cancelBooking = async (bookingId, params) => {
  try {
    const {data: response} = await api.put(
      `/mobility/booking/passenger-cancel/${bookingId}`,
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
