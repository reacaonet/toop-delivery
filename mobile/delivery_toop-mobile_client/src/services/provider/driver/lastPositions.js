import api from '../../api';
import {queryString} from '../../../utils';

export const lastPositions = async (driver, payload = {}) => {
  try {
    let query = queryString(payload);

    // console.log(
    //   'lastPositions',
    //   `/v1/mobility/driver/lastposition/${driver}?${query}`,
    // );

    const {data: response} = await api.get(
      `/v1/mobility/driver/lastposition/${driver}?${query}`,
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
