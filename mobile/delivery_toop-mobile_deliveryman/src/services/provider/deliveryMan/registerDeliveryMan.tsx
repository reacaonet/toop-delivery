import api from '../../api';
import ErrorAxios from '../errorAxios';

const registerDeliveryMan = async (data: any) => {
  try {
    const response = await api.post('/register-deliveryman/create/', data);
    const res = response.data;

    return res;
  } catch (err) {
    ErrorAxios(err, 'Fail Register Delivery Man');
    return null;
  }
};

export default registerDeliveryMan;
