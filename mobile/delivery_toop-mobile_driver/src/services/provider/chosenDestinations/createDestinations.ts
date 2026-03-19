import api, { ErrorMessageServer } from '../../api';

export const createDestination = async (payload: any) => {
  try {
    const { data: response } = await api.post(
      '/v1/mobility/chosen-destinations',
      payload,
    );

    return response;
  } catch (err) {
    return ErrorMessageServer(err);
  }
};
