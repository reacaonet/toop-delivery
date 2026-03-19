import api from '../../../api';
import ErrorAxios, {ErrorMessageServer} from '../../errorAxios';

const listDepartmentPaginate = async (
  company: string,
  term: string,
  pageIn = 0,
  pageOut = 100000,
) => {
  try {
    const response = await api.get(
      `/shopping/department/paginator?company=${company}&term=${term}&pageIn=${pageIn}&pageOut=${pageOut}`,
      {
        headers: {
          Company: company,
        },
      },
    );

    const data = response.data;
    if (data && data.data) {
      return data.data;
    }

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error listDepartment');
    return ErrorMessageServer(err);
  }
};

const listDepartmentOne = async (_id: string) => {
  try {
    const response = await api.get(`/shopping/department/${_id}`);

    const data = response.data;
    if (data && data.data) {
      return data.data;
    }

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error listDepartmentOne');
    return ErrorMessageServer(err);
  }
};

export {listDepartmentPaginate, listDepartmentOne};
