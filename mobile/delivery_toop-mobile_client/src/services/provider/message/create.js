import api, {ErrorMessageServer} from '../../api';

export const crateMessage = async params => {
  try {
    const {data: response} = await api.post('/mobility/message', params);

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
