import api, {ErrorMessageServer} from '../../api';
import {queryString} from '../../../utils';

export const createFavoritePlace = async (params: any) => {
  try {
    const {data: response} = await api.post(
      '/v1/mobility/favorite-place',
      params,
    );

    if (!response) {
      return ErrorMessageServer({});
    }

    return response;
  } catch (err) {
    return ErrorMessageServer(err);
  }
};

export const listFavoritePlace = async (params = {}) => {
  try {
    const getQuery = queryString(params);

    const {data: response} = await api.get(
      `/v1/mobility/favorite-place?${getQuery}`,
    );

    return response;
  } catch (err) {
    return null;
  }
};
