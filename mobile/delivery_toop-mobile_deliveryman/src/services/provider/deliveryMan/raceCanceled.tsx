import api from '../../api';
import {queryString} from '../../../utils';
import ErrorAxios from '../errorAxios';

interface TypeRaceCanceled {
  deliveryMan: String;
  order: String;
  date: Date;
}

interface TypeRaceList {
  order: String;
}

const raceCanceled = async (post: TypeRaceCanceled) => {
  try {
    const response = await api.post('/delivery-man/race/canceled', post);
    const data = response.data;

    return data;
  } catch (err) {
    ErrorAxios(err, 'Fail List Race Canceled');
    return null;
  }
};

const raceList = async (params = {} as TypeRaceList) => {
  try {
    const getQuery = queryString(params);
    const response = await api.get(`/deliveryMan/race/list?${getQuery}`);
    const data = response.data;

    return data;
  } catch (err) {
    ErrorAxios(err, 'Fail List Race Canceled');
    return null;
  }
};

export {raceCanceled, raceList};
