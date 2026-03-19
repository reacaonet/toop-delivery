import api, {ErrorMessageServer} from '../../api';

const deleteUser = async id => {
  try {
    const response = await api.delete(`/person/${id}`);
    const data = response.data;
    return data;
  } catch (err) {
    return ErrorMessageServer(err);
  }
};

export {deleteUser};
