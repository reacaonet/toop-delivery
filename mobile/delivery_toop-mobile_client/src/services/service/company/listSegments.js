import api from '../../api';
import {queryString} from '../../../utils';

export const listSegments = async (latitude, longitude, params = {}) => {
  try {
    const getQuery = queryString(params);

    const response = await api.get(
      `/company/segment/list-category/location/${latitude}/${longitude}?${getQuery}`,
    );

    const data = response.data;
    return data;
  } catch (err) {
    console.log('Fail listSegments', err);
    return null;
  }
};

export const listOneSegment = async segmentId => {
  try {
    const {data: response} = await api.get(`/company/segment/one/${segmentId}`);

    return response;
  } catch (err) {
    console.log('Fail listOneSegment', err);
    return null;
  }
};
