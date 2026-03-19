import api, {ErrorAxios, ErrorMessageServer} from '../../api';
import {queryString} from '../../../utils';

export const verifyPixPayment = async (cartId, params = {}) => {
  try {
    let getQuery = queryString(params);

    const {data: response} = await api.get(
      `/v2/pix/verify/${cartId}?${getQuery}`,
    );
    return response;
  } catch (err) {
    // ErrorAxios(err, 'Fail verifyPixPayment');
    // return ErrorMessageServer(err);
    return null;
  }
};
