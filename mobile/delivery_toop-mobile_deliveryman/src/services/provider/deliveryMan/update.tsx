import api from '../../api';
import ErrorAxios from '../errorAxios';

const updateDeliveryMan = async (id: string, data: any) => {
  try {
    // console.log('Update', `/delivery-man/update/${id}`, data);

    const response = await api.put(`/delivery-man/update/${id}`, data);
    const res = response.data;

    return res;
  } catch (err) {
    ErrorAxios(err, 'Fail Update Delivery Man');
    return null;
  }
};

export default updateDeliveryMan;
