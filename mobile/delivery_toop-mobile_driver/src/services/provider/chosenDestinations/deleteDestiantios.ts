import api, { ErrorMessageServer } from '../../api';

export const deleteDestination = async (driver: string, id: string) => {
  try {
    const { data: response } = await api.delete(
      `/v1/mobility/chosen-destinations/${driver}/${id}`,
    );

    return response;
  } catch (err) {
    return ErrorMessageServer(err);
  }
};
