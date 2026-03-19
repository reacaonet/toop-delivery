import api from '../../api';

export const updateSelectedCompany = async (user: string, company: any) => {
  try {
    const response = await api.put(`/users/${user}/update-selected-company`, {
      company,
    });
    const data = response.data;
    return data;
  } catch (err) {
    if (err.response && err.response.data) {
      console.log('Fail updateSelectedCompany', err.response.data);
    } else {
      console.log('Fail updateSelectedCompany', err);
    }

    return null;
  }
};
