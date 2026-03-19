import api from '../../../api';
import ErrorAxios, {ErrorMessageServer} from '../../errorAxios';

const updateCategory = async (company: string, _id: string, body: any) => {
  try {
    const response = await api.put(`/food/category/${_id}`, body, {
      headers: {
        Company: company,
      },
    });

    const data = response.data;

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error updateCategory');
    return ErrorMessageServer(err);
  }
};

export {updateCategory};
