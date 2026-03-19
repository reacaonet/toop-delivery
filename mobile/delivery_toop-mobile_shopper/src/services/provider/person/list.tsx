import api from '../../api';
import {queryString} from '../../../utils';
import ErrorAxios from '../errorAxios';

const listPersonOne = async (personId: string, params: any) => {
  try {
    const getQuery = queryString(params);
    const response = await api.get(`/person/${personId}?${getQuery}`);
    const data = response.data;
    return data;
  } catch (err) {
    ErrorAxios(err, 'Fail Person ListOne');
    return null;
  }
};

const listPersonSearch = async (params: any) => {
  try {
    const getQuery = queryString(params);
    const response = await api.get(`/person/search?${getQuery}`);
    const data = response.data;
    return data;
  } catch (err) {
    ErrorAxios(err, 'Fail person listPersonSearch');
    return null;
  }
};

export {listPersonOne, listPersonSearch};
