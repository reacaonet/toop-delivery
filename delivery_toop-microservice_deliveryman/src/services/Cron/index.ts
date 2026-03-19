/* eslint-disable new-cap */
/* eslint-disable require-jsdoc */
/* eslint-disable @typescript-eslint/no-explicit-any */

import WaitForProcess from './wait';
import processOne from './processOne';
import processNext from './processNext';
import finishProcessAttempts from './finishProcessAttempts';
import captureError from './error/captureError';

function Start(): any {
  try {
    WaitForProcess();
    processOne();
    processNext();
    finishProcessAttempts();
  } catch (err) {
    captureError('Oops Fail Init Process ...', err);
  }
}

export default Start;
