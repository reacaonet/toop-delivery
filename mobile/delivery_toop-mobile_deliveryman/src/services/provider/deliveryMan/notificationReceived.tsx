import api from '../../api';

const notificationReceived = async (orderId: any, post: any) => {
  try {
    // console.log('Url', `/delivery-man/queue-notification-received/${orderId}`);

    const response = await api.put(
      `/delivery-man/queue-notification-received/${orderId}`,
      post,
    );
    const data = response.data;
    if (data && data.data) {
      return data.data;
    }

    return data;
  } catch (err) {
    console.log('Error notificationReceived', err.response.data);
    return null;
  }
};

export default notificationReceived;
