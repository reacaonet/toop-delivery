import api from '../../api';

const createHour = async (company: string, body: any) => {
  try {
    const response = await api.post(`/company/hours`, body, {
      headers: {
        Company: company,
      },
    });

    return true;
  } catch (err) {
    if (err.response && err.response.data) {
      console.log('Fail create hour', err.response.data);
    } else {
      console.log('Fail create hour2', err);
    }

    return null;
  }
};

const listHours = async (company: string) => {
  try {
    const response = await api.get(`/company/hours/${company}`, {
      headers: {
        Company: company,
      },
    });

    return response.data;
  } catch (err) {
    if (err.response && err.response.data) {
      console.log('Fail create hour', err.response.data);
    } else {
      console.log('Fail create hour2', err);
    }

    return null;
  }
};

const deleteHour = async (hour: string) => {
  try {
    const response = await api.delete(`/company/hours/${hour}`);
    return true;
  } catch (err) {
    if (err.response && err.response.data) {
      console.log('Fail delete hour', err.response.data);
    } else {
      console.log('Fail delete hour2', err);
    }

    return null;
  }
};

const updateHour = async (hour: string, body: any) => {
  try {
    const response = await api.put(`/company/hours/${hour}`, body);
    return true;
  } catch (err) {
    if (err.response && err.response.data) {
      console.log('Fail update hour', err.response.data);
    } else {
      console.log('Fail update hour2', err);
    }

    return null;
  }
};

export {createHour, deleteHour, updateHour, listHours};
