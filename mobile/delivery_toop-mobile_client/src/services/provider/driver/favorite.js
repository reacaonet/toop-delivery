import api, {ErrorMessageServer} from '../../api';

export const favoriteDriver = async (driver, passenger) => {
  try {
    const {data: response} = await api.post('/mobility/driver/favorite', {
      driver,
      passenger,
    });

    return response;
  } catch (err) {
    return ErrorMessageServer(err);
  }
};
