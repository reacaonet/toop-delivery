import api, { ErrorMessageServer } from '../../api';

export const listDestination = async (driver: string, payload: any = {}) => {
  try {
    const { data: response } = await api.get(
      `/v1/mobility/chosen-destinations?driver=${driver}`,
      payload,
    );

    return response;
  } catch (err) {
    return null;
  }
};
