import database from '../../config/firebase';

/** Service */
import captureError from '../error/captureError';

const delayFirebase = 20000; // milissegundos

const sendNotification = async (
  driverId: string,
  params: unknown,
): Promise<void> => {
  try {
    if (!database) {
      return;
    }

    const db = database;

    await db
      .ref()
      .child(`${process.env.FIREBASE_PATH}booking/driver/${driverId}`)
      .set(params);

    setTimeout(async () => {
      if (!database) {
        return;
      }
      return await database
        .ref(`${process.env.FIREBASE_PATH}booking/driver/${driverId}`)
        .remove();
    }, delayFirebase);
  } catch (err) {
    captureError('fail sendNotification', err);
  }
};

export default sendNotification;
