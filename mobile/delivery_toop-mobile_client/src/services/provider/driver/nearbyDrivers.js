import api from '../../api';

export const nearbyDrivers = async (latitude, longitude) => {
  try {
    const {data: response} = await api.post('/mobility/driver/nearby-drivers', {
      latitude,
      longitude,
    });
    return response;
  } catch (err) {
    return null;
  }
};
