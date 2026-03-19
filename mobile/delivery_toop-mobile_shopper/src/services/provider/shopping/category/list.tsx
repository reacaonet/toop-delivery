import api from '../../../api';
import ErrorAxios, {ErrorMessageServer} from '../../errorAxios';

const listCategory = async (company: string, term: string) => {
  console.log(company);
  try {
    const response = await api.get(`/food/category/by-company?term=${term}`, {
      headers: {
        company: company,
      },
    });

    const data = response.data;
    if (data && data.data) {
      return data.data;
    }

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error listCategory');
    return ErrorMessageServer(err);
  }
};

export {listCategory};
