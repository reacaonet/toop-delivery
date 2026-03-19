import api, {ErrorMessageServer} from '../../api';

export const createBooking = async params => {
  try {
    const {data: response} = await api.post('/mobility/booking', params);

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
