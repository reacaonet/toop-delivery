import api, {ErrorMessageServer} from '../../api';
import {queryString} from '../../../utils';

export const bookingHistoric = async (
  passengerId,
  pageIn = 1,
  pageOut = 30,
) => {
  try {
    const {data: response} = await api.get(
      `/mobility/booking/passenger/${passengerId}?pageIn=${pageIn}&pageOut=${pageOut}`,
    );

    return response;
  } catch (err) {
    return ErrorMessageServer(err);
  }
};

export const lastBookingHistoricPassenger = async (params = {}) => {
  try {
    const query = queryString(params);

    const {data: response} = await api.get(
      `/v1/mobility/booking/last-historic-passenger?${query}`,
    );

    return response;
  } catch (err) {
    return [];
  }
};
