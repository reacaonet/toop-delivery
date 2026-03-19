import captureError from './error/captureError';
import waitForProcess from './wait';
import paidOrderProcess from './paidOrder';
import dispatchOrderProcess from './dispatchOrder';

function startQueue(): any {
  try {
    waitForProcess();
    paidOrderProcess();
    dispatchOrderProcess();
  } catch (err) {
    captureError('Oops Fail Init Process ...', err);
  }
}

export default startQueue;
