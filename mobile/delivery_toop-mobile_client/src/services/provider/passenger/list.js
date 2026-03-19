import api from '../../api';
import {queryString} from '../../../utils';

export const listPassengerOne = async (passengerId, params = {}) => {
  try {
    const getQuery = queryString(params);

    const {data: response} = await api.get(
      `/mobility/passengers/${passengerId}?${getQuery}`,
    );

    return response;
  } catch (err) {
    console.log('fail listPassengerOne', err);
    return null;
  }
};
