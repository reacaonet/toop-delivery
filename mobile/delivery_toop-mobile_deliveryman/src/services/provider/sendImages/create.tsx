import api from '../../api';
import ErrorAxios from '../errorAxios';

const sendImages = async (image: string, folder: string) => {
  try {
    const response = await api.post('/send-images/', {image, folder});
    const res = response.data;

    return res;
  } catch (err) {
    ErrorAxios(err, 'Fail Create Status Online Delivery Man');
    return null;
  }
};

export {sendImages};
