import api from '../../api';

export const createPassenger = async params => {
  try {
    const {data: response} = await api.post('/mobility/passengers', params);

    if (response.data && response.data._id) {
      return response.data;
    }

    return response;
  } catch (err) {
    console.log('fail createPassenger', err);
    return null;
  }
};
