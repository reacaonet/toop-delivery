import api from '../../api';

const updateToken = async (userId: string, params: any) => {
  try {
    const response = await api.put(`/user/push-token/${userId}`, params);
    const {data: resp} = response;
    return resp;
  } catch (err) {
    if (err.response && err.response.data) {
      console.log('Fail updateToken', err.response.data);
    } else {
      console.log('Fail updateToken', err);
    }

    return null;
  }
};

export default updateToken;
