import api from '../../../api';
import ErrorAxios, {ErrorMessageServer} from '../../errorAxios';

const updateDepartment = async (departmentId: string, body: any) => {
  try {
    const response = await api.put(
      `/shopping/department/${departmentId}`,
      body,
    );

    const data = response.data;

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error updateDepartment');
    return ErrorMessageServer(err);
  }
};

const orderUpdateDepartment = async (departmentId: string, body: any) => {
  try {
    const response = await api.put(
      `/product/sort-update-department/${departmentId}`,
      body,
    );

    const data = response.data;

    return data;
  } catch (err) {
    ErrorAxios(err, 'Error orderUpdateDepartment');
    return ErrorMessageServer(err);
  }
};

export {updateDepartment, orderUpdateDepartment};
