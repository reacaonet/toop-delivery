import api, { ErrorMessageServer } from '../api';

export const listPreRegistration = async (phone: string): Promise<any> => {
  try {
    const { data } = await api.get(`/pre-register/${phone}`);

    if (!data) {
      console.log('Não conseguimos buscar pre cadastro');
      return null;
    }
    return data;
  } catch (err) {
    ErrorMessageServer(err);
    return null;
  }
};
