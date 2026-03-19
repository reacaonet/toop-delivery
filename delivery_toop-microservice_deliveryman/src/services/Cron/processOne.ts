/* eslint-disable operator-linebreak */
/* eslint-disable max-len */
/* eslint-disable quote-props */
/* eslint-disable @typescript-eslint/no-use-before-define */
import moment from 'moment';
import apiEconomizeBr from '../apiEconomizeBr';
import cloudMessage from '../cloudMessage';
import database from '../../config/firebase';
import captureError from './error/captureError';

const delay = 10000;
const delayFirebase = 20000;

const restartService = (): void => {
  setTimeout(() => {
    try {
      return processOne();
    } catch (err) {
      captureError('restartService processOne', err);
      return restartService();
    }
  }, delay);
};

async function processOne(): Promise<void> {
  try {
    const data = await apiEconomizeBr.get(
      '/delivery-man/queue/status/PROCESS?initial=true',
    );
    const queue = data.data;
    let sendToDeliveryMan = null;

    if (!queue || !queue._id) {
      return restartService();
    }

    if (queue.sendToDeliveryMan) {
      sendToDeliveryMan = queue.sendToDeliveryMan;
    }

    // Pesquisa os DeliveryMan Disponível
    const {data: deliveryMan} = await apiEconomizeBr.post(
      'delivery-man/search-one',
      {
        lat: queue.locationCompany.coordinates[1],
        lng: queue.locationCompany.coordinates[0],
        sendToDeliveryMan,
        typeVehicle: queue.typeOfVehicle ? queue.typeOfVehicle : null,
        sendToListDeliveryMan: queue.sendToListDeliveryMan
          ? queue.sendToListDeliveryMan
          : null,
      },
    );

    if (!deliveryMan) {
      // await updateNotFound(queue);
      await apiEconomizeBr.put(`delivery-man/queue/${queue._id}`, {
        attempt: 1,
        historicDeliveryMan: [],
        deliveryManProcess: [],
        lastData: moment().utc(false).format(),
      });
      return processOne();
    }

    // Vincular o DeliveryMan e setar a Data - Dispara para o Firebase avisando

    const {data: queueUpdate} = await apiEconomizeBr.put(
      `delivery-man/queue/${queue._id}`,
      {
        attempt: 1,
        deliveryMan: deliveryMan._id,
        lastData: moment().utc(false).format(),
        historicDeliveryMan: [
          {
            _id: deliveryMan._id,
            data: moment().utc(false).format(),
          },
        ],
        deliveryManProcess: [deliveryMan._id],
      },
    );

    if (!queueUpdate) {
      console.log('Validar depois filas que falharam ao mudar de estado');
      return restartService();
    }

    await sendNotification(queue.order._id, deliveryMan, {
      companyLatitude: queue.locationCompany?.coordinates[1] || 0,
      companyLongitude: queue.locationCompany?.coordinates[0] || 0,
      companyName: queue.company.name,
      customerLatitude: queue.order.customerDelivery.location.coordinates[1],
      customerLongitude: queue.order.customerDelivery.location.coordinates[0],
    });
    return processOne();
  } catch (err) {
    captureError('Fail ProcessOne', err);
    return restartService();
  }
}

const sendNotification = async (
  orderId: string,
  deliveryMan: any,
  params = {},
): Promise<void> => {
  try {
    const price = await getDeliveryPrice(orderId, deliveryMan);

    await database
      .ref()
      .child(
        `${process.env.FIREBASE_PATH}new/order/person=${deliveryMan.person}`,
      )
      .set({
        message: 'Você tem uma nova entrega',
        orderId: orderId,
        raceValue: price,
        deliverymanLatitude: deliveryMan?.location?.coordinates[1],
        deliverymanLongitude: deliveryMan?.location?.coordinates[0],
        ...params,
      })
      .catch((err) => {
        captureError('sendNotification firebase', err);
      });

    await notificationDelivery(orderId, deliveryMan, price);

    // Excluir referência
    setTimeout(async () => {
      try {
        return await database
          .ref()
          .child(
            `${process.env.FIREBASE_PATH}new/order/person=${deliveryMan.person}`,
          )
          .remove();
      } catch (err) {
        captureError('sendNotification database', err);
      }
    }, delayFirebase);

    return;
  } catch (err) {
    captureError('Fail sendNotification', err);
    return;
  }
};

const notificationDelivery = async (
  orderId: string,
  deliveryMan: any,
  price: number,
  params: any = null,
): Promise<void> => {
  try {
    if (deliveryMan.token) {
      await cloudMessage.post(
        '',
        {
          priority: 'high',
          to: deliveryMan.token,
          notification: {
            body: 'Você tem uma nova entrega',
          },
          sound: 'default',
          vibrate: '1',
          collapseKey: deliveryMan._id,
          'apns-collapse-id': deliveryMan._id,
          time_to_live: 15,
          data: {
            isNewOrder: true,
            orderId: orderId,
            raceValue: price,
            params: params,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${process.env.CLOUD_MESSAGING_TOKEN}`,
          },
        },
      );
    }
  } catch (err) {
    captureError('Fail notificationDelivery', err);
  }
};

const updateNotFound = async (queue: any): Promise<void> => {
  try {
    await apiEconomizeBr.put(`deliveryMan/queue/${queue._id}`, {
      status: 'NOT_FOUND_DELIVERYMAN',
      attempt: 1,
      historicDeliveryMan: [],
      deliveryManProcess: [],
      lastData: moment().utc(false).format(),
    });

    return;
  } catch (err) {
    captureError('updateNotFound', err);
    return;
  }
};

const getDeliveryPrice = async (
  orderId: string,
  deliveryMan: any,
): Promise<any> => {
  try {
    let price = 0;

    if (
      deliveryMan &&
      deliveryMan.deliveryFee &&
      deliveryMan.deliveryFee.percentage &&
      deliveryMan.deliveryFee.percentage > 0
    ) {
      const {data: deliveryPrice} = await apiEconomizeBr.get(
        `/delivery-man/delivery-price/${orderId}`,
      );

      if (
        deliveryPrice &&
        deliveryPrice.payment &&
        deliveryPrice.payment.priceDelivery &&
        deliveryPrice.payment.priceDelivery > 0
      ) {
        price = deliveryPrice.payment.priceDelivery;
      }

      if (
        deliveryMan &&
        deliveryMan.deliveryFee &&
        deliveryMan.deliveryFee.percentage
      ) {
        price = (price * deliveryMan.deliveryFee.percentage) / 100;
      }

      return price;
    }

    return 0.1;
  } catch (err) {
    captureError('Fail getDeliveryPrice', err);
    return 0.1;
  }
};

export default processOne;
export {sendNotification};
