import api from '../../api';

const listWeekDays = async (companyId, typeSchedule) => {
  try {
    const response = await api.get(
      `/shopping/schedule/${companyId}?type=${typeSchedule}`,
    );

    const data = response.data;

    return data;
  } catch (err) {
    console.log('Fail DaysWeek List', err);
    return null;
  }
};

const haveSchedule = async companyId => {
  try {
    const {data: response} = await api.get(
      `/shopping/schedule/have/${companyId}`,
    );

    return response;
  } catch (err) {
    return null;
  }
};

export {haveSchedule};
export default listWeekDays;
