import api from '../../api';
import ErrorAxios from '../errorAxios';

const listOne = async (id: string) => {
  try {
    // console.log('Get', `/delivery-man/list/${id}`);

    const response = await api.get(`/delivery-man/list/${id}`);
    const res = response.data;

    return res;
  } catch (err) {
    ErrorAxios(err, 'Fail List listOne Delivery Man');
    return null;
  }
};

export default listOne;
