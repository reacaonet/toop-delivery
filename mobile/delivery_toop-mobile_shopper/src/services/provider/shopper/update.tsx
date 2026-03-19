import api from '../../api';

const updateShopper = async (id, post) => {
  try {
    const response = await api.put(`/shopper/${id}`, post);
    const data = response.data;

    if (data && data.data) {
      return data.data;
    }

    return data;
  } catch (err) {
    console.log('Fail Customer List', err);
    console.log(id, post);
    return false;
  }
};

export {updateShopper};
