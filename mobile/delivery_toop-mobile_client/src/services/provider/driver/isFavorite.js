import api, {ErrorMessageServer} from '../../api';

export const isFavorite = async (driver, passenger) => {
  try {
    const {data: response} = await api.get(
      `/mobility/driver/favorite/driver/${driver}/passenger/${passenger}`,
    );

    return response;
  } catch (err) {
    return ErrorMessageServer(err);
  }
};
