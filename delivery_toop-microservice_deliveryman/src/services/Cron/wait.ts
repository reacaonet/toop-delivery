/* eslint-disable new-cap */
/* eslint-disable require-jsdoc */
/* eslint-disable @typescript-eslint/no-use-before-define */
import apiEconomizeBr from '../apiEconomizeBr';
import captureError from './error/captureError';

const delay = 10000;

const restartService = (): void => {
  setTimeout(async () => {
    try {
      return await WaitForProcess();
    } catch (err) {
      captureError('restartService Wait', err);
      return restartService();
    }
  }, delay);
};

async function WaitForProcess(): Promise<void> {
  try {
    const data = await apiEconomizeBr.get('/deliveryMan/queue/status/WAIT');
    const queue = data.data;

    if (!queue || !queue._id) {
      return restartService();
    }

    // Modificar Status para processamento
    await apiEconomizeBr.put(`/deliveryMan/queue/${queue._id}/status`, {
      status: 'PROCESS',
    });

    return WaitForProcess();
  } catch (err) {
    captureError('WaitForProcess', err);
    return restartService();
  }
}

export default WaitForProcess;
