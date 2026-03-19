import api from '../../api';

export const listServices = async (driverId: string): Promise<any> => {
  try {
    const { data: response } = await api.get(
      `/mobility/services/list?driver=${driverId}`,
    );

    return response;
  } catch (err) {
    return null;
  }
};
