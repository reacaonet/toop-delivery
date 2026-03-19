import api from '../../../api';
import ErrorAxios, {ErrorMessageServer} from '../../errorAxios';

const createCategory = async (company: string, body: any) => {
  try {
    const response = await api.post(`/food/category`, body, {
      headers: {
        Company: company,
      },
    });

    const data = response.data;

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error createCategory');
    return ErrorMessageServer(err);
  }
};

export {createCategory};
