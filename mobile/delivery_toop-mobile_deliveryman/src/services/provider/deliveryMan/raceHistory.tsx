import api from '../../api';
import ErrorAxios from '../errorAxios';
// import {queryString} from '../../../utils';

const newRaceHistory = async (params: any) => {
  try {
    const {data: response} = await api.post(
      '/delivery-man/race-history',
      params,
    );
    return response;
  } catch (err) {
    ErrorAxios(err, 'Fail newRaceHistory Delivery Man');
    return null;
  }
};

const getUserHistory = async (date: any, userId: any, dateFinal: string) => {
  try {
    let params = `${userId}?date=${date}`;
    if (dateFinal) {
      params += `&dateFinal=${dateFinal}`;
    }

    const response = await api.get(`/v2/report/deliveryman/races/${params}`);
    return response.data;
  } catch (err) {
    ErrorAxios(err, 'Fail getUserHistory Delivery Man');
    return null;
  }
};

export {newRaceHistory, getUserHistory};
