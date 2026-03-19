import api from '../../api';

export const listMessage = async (booking: string): Promise<any> => {
  try {
    const {data: response} = await api.get(
      `/v1/mobility/message?booking=${booking}`,
    );

    return response;
  } catch (err) {
    console.log('fail averageDriver', err);
    return null;
  }
};

export const listConversations = async (passenger: string): Promise<any> => {
  try {
    const {data: response} = await api.get(
      `/v1/mobility/message/conversations?passenger=${passenger}`,
    );

    return response;
  } catch (err) {
    console.log('fail averageDriver', err);
    return null;
  }
};
