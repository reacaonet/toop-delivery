import api from '../../api';

export const listMessage = async (booking: string): Promise<any> => {
  try {
    const { data: response } = await api.get(
      `/v1/mobility/message?booking=${booking}`,
    );

    return response;
  } catch (err) {
    console.log('fail averageDriver', err);
    return null;
  }
};

export const listConversations = async (driver: string): Promise<any> => {
  try {
    const { data: response } = await api.get(
      `/v1/mobility/message/conversations?driver=${driver}`,
    );

    return response;
  } catch (err) {
    console.log('fail averageDriver', err);
    return null;
  }
};
