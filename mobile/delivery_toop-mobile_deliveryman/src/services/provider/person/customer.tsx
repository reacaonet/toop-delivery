import api from '../../api';
//import {queryString} from '../../../utils';
import ErrorAxios from '../errorAxios';

const getCustomer = async (idCustomer: string) => {
  try {
    const response = await api.get(`/customer/list/${idCustomer}`);
    const data = response.data;
    return data;
  } catch (err) {
    return ErrorAxios(err, 'Error get customer');
  }
};

export default getCustomer;
export {getCustomer};
