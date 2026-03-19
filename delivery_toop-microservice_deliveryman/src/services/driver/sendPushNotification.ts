/* eslint-disable quote-props */
/** Service */
import cloudMessage from '../cloudMessage';
import captureError from '../error/captureError';

const sendPushNotification = async (
  token: string,
  id: string,
  data: unknown = {},
): Promise<void> => {
  try {
    const {data: response}: any = await cloudMessage.post(
      '',
      {
        priority: 'high',
        to: token,
        notification: {
          body: 'Nova solicitação corrida',
        },
        sound: 'default',
        vibrate: '1',
        collapseKey: id,
        'apns-collapse-id': id,
        time_to_live: 15,
        data: data,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${process.env.CLOUD_MESSAGING_TOKEN}`,
        },
      },
    );

    if (response.failure > 0) {
      console.log('Fail pushNotification', response.results);
    }
  } catch (err) {
    captureError('err sendPushNotification', err);
  }
};

export default sendPushNotification;
