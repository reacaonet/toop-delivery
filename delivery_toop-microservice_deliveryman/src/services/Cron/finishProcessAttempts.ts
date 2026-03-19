/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable max-len */
import moment from 'moment';
import apiEconomizeBr from '../apiEconomizeBr';
import captureError from './error/captureError';

const limit = 3;
const status = 'PROCESS';
const delay = 20000;
const maxAttempt = 20;

const restartService = (): void => {
  setTimeout(() => {
    try {
      finishProcessAttempts();
    } catch (err) {
      captureError('restartService processNext', err);
      restartService();
    }
  }, delay);
};

async function orderCurrent(orderId: string): Promise<any> {
  try {
    const {data: order} = await apiEconomizeBr.get(
      `order/delivery/cron/id/${orderId}`,
    );
    if (!order || !order._id) {
      console.log('orderCurrent not found ...', {orderId});
      return false;
    }

    return order;
  } catch (err) {
    captureError('finishProcessAttempts Fail orderCurrent', err);
    return false;
  }
}

/*
 * Verifica se a Ordem foi aceita se não cancelar
 */
async function cancelOrder(orderId: string): Promise<boolean> {
  try {
    const order: any = await orderCurrent(orderId);
    if (order && order._id && order.status === 'WAIT_DELIVERYMAN') {
      console.log('Pedido de Cancelamento enviado ...', orderId);
      await apiEconomizeBr.put(`/payment/cancel/order/${orderId}`); // Cancelar Pedido
    }

    return true;
  } catch (err) {
    captureError('Fail cancelOrder', err);
    return false;
  }
}

async function updateQueue(queue: any): Promise<boolean> {
  try {
    const {data: queueUp} = await apiEconomizeBr.put(
      `deliveryMan/queue/${queue._id}`,
      {
        status: 'FINISH',
        attempt: queue.attempt,
        historicDeliveryMan: queue.historicDeliveryMan,
        deliveryManProcess: queue.deliveryManProcess,
        lastData: moment().utc(false).format(),
      },
    );

    // if (queueUp && queueUp._id && queueUp.order && queueUp.attempt === 15) {
    //   await cancelOrder(queue.order);
    // }

    return true;
  } catch (err) {
    captureError('Fail finishQueue', queue);
    return false;
  }
}

/**
 * Todos os Processos com Tentativas máxima Atingidas Finalizar
 */
async function finishProcessAttempts(): Promise<void> {
  try {
    const dateLt = moment().utc(false).subtract(30, 'seconds').format();

    const {data: firstsQueue} = await apiEconomizeBr.get(
      `deliveryMan/queue?status=${status}&limit=${limit}&dateLt=${dateLt}&attemptGte=${maxAttempt}`,
    );

    if (!firstsQueue || firstsQueue.length <= 0) {
      restartService();
      return;
    }

    for await (const queue of firstsQueue) {
      await updateQueue(queue);
    }

    // console.log('firstsQueue', firstsQueue);
    finishProcessAttempts();
  } catch (err) {
    captureError('finishProcessAttempts', err);
    restartService();
  }
}

export default finishProcessAttempts;
