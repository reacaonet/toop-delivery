import apiEconomizeBr from '../apiEconomizeBr';
import restartService from './restartService';
import captureError from './error/captureError';
import QueueSplit from '../../models/QueueSplit';

const delay = 15000;
const serviceName = 'WaitForProcess';

async function waitForProcess(): Promise<void> {
  try {
    const response: any = await QueueSplit.findOne({
      status: 'WAIT',
    }).sort({createdAt: -1})
      .select({
        _id: 1,
        status: 1,
      })
      .lean();

    if (!response || !response._id ) {
      return restartService(waitForProcess, delay, serviceName);
    }

    await QueueSplit.updateOne({_id: response._id}, {
      status: 'PROCESS',
      phase: 'PAID_ORDER',
    });

    return waitForProcess();
  } catch (err) {
    captureError(`${serviceName}`, err);
    return restartService(waitForProcess, delay, serviceName);
  }
}

export default waitForProcess;
