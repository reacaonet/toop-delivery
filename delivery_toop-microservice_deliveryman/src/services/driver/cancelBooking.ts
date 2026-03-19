/** Global */
import api from '../apiEconomizeBr';

/** Service */
import restartService from '../restartService';

const delay = 20000;

const cancelBooking = async (): Promise<void> => {
  try {
    const {data: listCancel}: any = await api.get(
      '/mobility/booking/cancel-limit-reached',
    );

    if (!listCancel || !Array.isArray(listCancel) || listCancel.length <= 0) {
      return restartService(cancelBooking, delay, 'restart cancelBooking');
    }

    for await (const booking of listCancel) {
      // cancelar reserva
      await api.put('/mobility/booking/cancel-limit-reached', {
        bookingId: booking._id,
      });
    }

    return restartService(cancelBooking, 1000, '');
  } catch (err) {
    return restartService(cancelBooking, delay, 'restart cancelBooking');
  }
};

export default cancelBooking;
