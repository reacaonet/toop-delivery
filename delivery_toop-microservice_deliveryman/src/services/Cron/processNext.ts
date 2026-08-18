/* eslint-disable operator-linebreak */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable max-len */
import moment from 'moment';
import apiEconomizeBr from '../apiEconomizeBr';
import {sendNotification} from './processOne';
import captureError from './error/captureError';

const limit = 3;
const status = 'PROCESS';
const delay = 10000;
const waitingTime = 30; // in seconds
let deliveryLoop: Array<string | number>[] = [];

const restartService = (): void => {
  setTimeout(async () => {
    try {
      await processNext();
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
      console.log('orderCurrent not found ...');
      return false;
    }

    return order;
  } catch (err) {
    captureError('processNext orderCurrent', err);
    return false;
  }
}

// Status apto para ser processado - etapa 3
function verifyStatusProcess(status: string) {
  if (
    status === 'ACCEPT_DELIVERYMAN' ||
    status === 'RELEASE_SHOPPER' ||
    status === 'DELIVERY_ROUTE' ||
    status === 'FINISHED' ||
    status === 'CANCELED'
  ) {
    return false;
  }

  return true;
}

async function finishQueue(queue: any) {
  try {
    await apiEconomizeBr.put(`deliveryMan/queue/${queue._id}`, {
      status: 'FINISH',
      attempt: queue.attempt,
      historicDeliveryMan: queue.historicDeliveryMan,
      deliveryManProcess: queue.deliveryManProcess,
    });

    // console.log('Finalizado com Sucesso ...', queue._id);
    return true;
  } catch (err) {
    captureError('processNext finishQueue', err);
    return false;
  }
}

async function updateQueue(
  queueId: string,
  status: string,
  attempt: number,
  historicDeliveryMan: any,
  deliveryManProcess: any,
) {
  try {
    const {data: queueUp} = await apiEconomizeBr.put(
      `deliveryMan/queue/${queueId}`,
      {
        status: status,
        attempt: attempt,
        historicDeliveryMan: historicDeliveryMan,
        deliveryManProcess: deliveryManProcess,
        lastData: moment().utc(false).format(),
      },
    );

    return queueUp;
  } catch (err) {
    console.log('Fail finishQueue', err);
    return false;
  }
}

async function dispatch(queue: any) {
  try {
    const attempt = queue.attempt + 1;
    let deliveryManProcess = queue.deliveryManProcess;
    let historicDeliveryMan = queue.historicDeliveryMan;
    let sendToDeliveryMan = null;

    if (!historicDeliveryMan) {
      historicDeliveryMan = [];
    }

    if (!deliveryManProcess) {
      deliveryManProcess = [];
    }

    deliveryManProcess = [...deliveryManProcess, ...deliveryLoop];

    if (queue.sendToDeliveryMan) {
      sendToDeliveryMan = queue.sendToDeliveryMan;
    }

    // Pesquisa os DeliveryMan Disponível
    const {data: deliveryMan} = await apiEconomizeBr.post(
      'delivery-man/search-one',
      {
        lat: queue.locationCompany.coordinates[1],
        lng: queue.locationCompany.coordinates[0],
        DeliveryDifferent: deliveryManProcess,
        sendToDeliveryMan,
        typeVehicle: queue.typeOfVehicle ? queue.typeOfVehicle : null,
        sendToListDeliveryMan: queue.sendToListDeliveryMan
          ? queue.sendToListDeliveryMan
          : null,
      },
    );

    // Não encontrado modificar deliveryMan Process para uma nova tentativa
    if (!deliveryMan || !deliveryMan._id) {
      deliveryManProcess = [];
      await updateQueue(
        queue._id,
        'PROCESS',
        attempt,
        historicDeliveryMan,
        deliveryManProcess,
      );
      return;
    }

    // No loop não enviar pedido para o mesmo entregdor
    deliveryLoop.push(deliveryMan._id);

    historicDeliveryMan.push({
      _id: deliveryMan._id,
      data: moment().utc(false).format(),
    });

    deliveryManProcess.push(deliveryMan._id);

    const upQueue: any = await updateQueue(
      queue._id,
      'PROCESS',
      attempt,
      historicDeliveryMan,
      deliveryManProcess,
    );

    if (upQueue && upQueue._id) {
      sendNotification(queue.order._id, deliveryMan, {
        companyLatitude: queue.locationCompany?.coordinates[1] || 0,
        companyLongitude: queue.locationCompany?.coordinates[0] || 0,
        companyName: queue.company.name,
        customerLatitude: queue.order.customerDelivery.location.coordinates[1],
        customerLongitude: queue.order.customerDelivery.location.coordinates[0],
      });
    }

    return true;
  } catch (err) {
    captureError('processNext dispatch', err);
    return false;
  }
}

async function processNext(): Promise<void> {
  try {
    const dateLt = moment()
      .utc(false)
      .subtract(waitingTime, 'seconds')
      .format();
    const rangeAttempt = '1,20';
    const {data: firstsQueue} = await apiEconomizeBr.get(
      `delivery-man/queue?status=${status}&limit=${limit}&dateLt=${dateLt}&rangeAttempt=${rangeAttempt}&seconds=${waitingTime}`,
    );

    if (!firstsQueue || firstsQueue.length <= 0) {
      return restartService();
    }

    deliveryLoop = [];

    for await (const queue of firstsQueue) {
      try {
        const orderId = queue.order._id;
        const order = await orderCurrent(orderId);

        if (order && order.status && verifyStatusProcess(order.status)) {
          await dispatch(queue); // Pode ser Processado
        } else if (
          order &&
          order.status &&
          verifyStatusProcess(order.status) === false
        ) {
          await finishQueue(queue); // Não Pode ser Processado marcar como finalizado
        }
      } catch (err) {
        captureError('processNext for await', err);
      }
      // Validar por algum motivo a order não existe
    }

    return processNext();
  } catch (err) {
    captureError('Fail processNext', err);
    return restartService();
  }
}

export default processNext;
