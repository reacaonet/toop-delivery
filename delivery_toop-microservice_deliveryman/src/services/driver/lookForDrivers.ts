/* eslint-disable operator-linebreak */
/* eslint-disable @typescript-eslint/no-use-before-define */
/** Global */
import moment from 'moment';
import api from '../apiEconomizeBr';

/** Service */
import restartService from '../restartService';
import sendNotification from './sendNotification';
import sendPushNotification from './sendPushNotification';

const delay = 10000;
const limitSeconds = 20;

const lookForDrivers = async (): Promise<void> => {
  try {
    const {data: listQueue}: any = await api.get('/mobility/booking/queue');

    if (!listQueue || !Array.isArray(listQueue) || listQueue.length <= 0) {
      return restartService(lookForDrivers, delay, 'restart lookForDrivers');
    }

    for await (const queue of listQueue) {
      try {
        // validar posteriormente se o status ainda é valido da queue
        const payload: any = {
          booking: queue._id,
          latitude: queue.origin.coordinates[1],
          longitude: queue.origin.coordinates[0],
          service: queue.service._id,
          raceToDriver: queue?.raceToDriver || null,
          notDrivers: queue?.notNotifiedDrivers || [],
          refused: queue?.refused || [],
          radiusSendRace: queue?.service?.radiusSendRace || null,
        };

        if (queue?.passenger && queue?.passenger?.person?.genre) {
          payload.genre = queue?.passenger?.person?.genre;
        }

        // Buscar Motoristas disponíveis
        const {data: driver}: any = await api.post(
          `/mobility/driver/available-receive-race`,
          payload,
        );

        if (driver && driver._id) {
          const sentDate = moment().utc(false).format();
          let service = ' - ';

          if (queue?.service?.name) {
            service = `${queue?.service?.name}`.toString();
          }

          if (driver.token) {
            await sendPushNotification(driver.token, driver._id, {
              message: 'Nova solicitação corrida',
              price: queue.price,
              bookingId: queue._id,
              sentDate: sentDate,
              limitSeconds: limitSeconds,
              reasonTrip: queue?.reasonTrip || '',
              address: getAddress(queue),
              addressDestiny: getDestinyAddress(queue),
              service: service,
              coin: queue?.payment?.coin || '',
              currencySymbol: queue?.payment?.currencySymbol || '',
            });
          }

          await sendNotification(driver._id, {
            message: 'Nova solicitação corrida',
            price: queue.price,
            typePayment: queue?.payment?.typePayment
              ? queue?.payment?.typePayment
              : '',
            typePaymentTxt: queue?.payment?.typePaymentTxt
              ? queue?.payment?.typePaymentTxt
              : '',
            bookingId: queue._id,
            passengerName: queue?.passenger?.person?.name || '',
            passengerCpf: queue?.passenger?.person?.cpf || '',
            passengerImage: queue?.passenger?.person?.image || '',
            passengerStars: queue?.passenger?.stars || 0,
            service: service,
            sentDate: sentDate,
            distance: queue?.distance || '',
            routeTime: queue?.routeTime || '',
            limitSeconds: limitSeconds,
            reasonTrip: queue?.reasonTrip || '',
            address: getAddress(queue),
            addressDestiny: getDestinyAddress(queue),
            distancePassenger: driver?.distance || '',
            routeTimePassenger: driver?.routeTime || '',
            origin: queue?.origin,
            destiny: queue?.destiny,
            totalRacesPassenger: queue?.totalRacesPassenger || 0,
            totalRacesDriver: queue?.totalRacesDriver || 0,
            percentPeakHours: queue?.percentPeakHours || 0,
            coin: queue?.payment?.coin || '',
            currencySymbol: queue?.payment?.currencySymbol || '',
          });

          // console.log('Notificação enviada ...');
        }
      } catch (err) {
        console.log('oops fail in queue', err);
      }
    }

    return restartService(lookForDrivers, 100, '');
  } catch (err) {
    return restartService(lookForDrivers, delay, 'restart lookForDrivers');
  }
};

const getAddress = (queue: any) => {
  try {
    return queue.origin.address;
  } catch (err) {
    return '';
  }
};

const getDestinyAddress = (queue: any) => {
  try {
    return queue.destiny[queue.destiny.length - 1].address;
  } catch (err) {
    return '';
  }
};

export default lookForDrivers;
