import api from '../../api';

export const driverLocation = async driver => {
  try {
    const {data: response} = await api.get(
      `/mobility/driver/location/current/${driver}`,
    );

    return response;
  } catch (err) {
    let errMessage = 'Não conseguimos listar';

    if (err.response && err.response.data) {
      if (err.response.data.message) {
        errMessage = err.response.data.message;
      }
    }

    return {
      errMessage: errMessage,
    };
  }
};
