import api, {ErrorMessageServer} from '../../api';

export const geoCode = async (params: any): Promise<any> => {
  try {
    const {data: response} = await api.post('/v1/mobility/maps/geo', params);

    if (!response) {
      return ErrorMessageServer({});
    }

    return response;
  } catch (err) {
    return ErrorMessageServer(err);
  }
};
