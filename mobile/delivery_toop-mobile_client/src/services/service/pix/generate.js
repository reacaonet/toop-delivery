import api, {ErrorAxios, ErrorMessageServer} from '../../api';
import {queryString} from '../../../utils';

export const generatePIX = async params => {
  try {
    const {data: response} = await api.post('/v2/pix/create-charge', params);
    return response;
  } catch (err) {
    ErrorAxios(err, 'Fail generatePIX');
    return ErrorMessageServer(err);
  }
};
