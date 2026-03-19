import api, { ErrorMessageServer } from '../../api';

export const listPreRegistration = async (
  phone: string,
  ddi: string,
): Promise<any> => {
  try {
    const { data } = await api.get(
      `/pre-register/${phone}?ddi=${encodeURIComponent(ddi)}`,
    );

    if (!data) {
      console.log('Não conseguimos buscar pre cadastro');
      return {};
    }
    return data;
  } catch (err) {
    ErrorMessageServer(err);
    return {};
  }
};
