import api from '../../api';

const updateOne = async (company: string, body: any) => {
  try {
    const response = await api.put(`/company/${company}`, body);
    const data = response.data;
    return data;
  } catch (err) {
    if (err.response && err.response.data) {
      console.log('Fail Company update', err.response.data);
    } else {
      console.log('Fail Company update', err);
    }

    return null;
  }
};

const updateAvailability = async (company: string, isOpen: boolean) => {
  try {
    const obj = {isOpen: isOpen, isManual: true};

    const response = await api.put(
      `/company/company-delivery/open-company/`,
      obj,
      {
        headers: {
          Company: company,
        },
      },
    );
  } catch (err) {
    if (err.response && err.response.data) {
      console.log('Fail updateAvailability', err.response.data);
    } else {
      console.log('Fail updateAvailability', err);
    }

    return null;
  }
};

export {updateOne, updateAvailability};
