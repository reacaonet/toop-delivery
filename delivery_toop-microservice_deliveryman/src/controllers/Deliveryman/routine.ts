import database from '../../config/firebase';
import {CronJob} from 'cron';
import apiEconomizeBr from '../../services/apiEconomizeBr';

export default {
  async function(
    shopperCompany: string,
    orderId: string,
    job: CronJob,
    count: number,
    loop: number,
  ): Promise<void> {
    if (!database) {
      return job.stop();
    }

    const db = database;

    if (loop > 3) {
      await db.ref().child(`notFound_${shopperCompany}`).push({
        message: 'Nenhum entregador foi encontrado',
      });
      await db.ref().child(`notFound_${shopperCompany}`).remove();
      return job.stop();
    }

    try {
      const {data: order} = await apiEconomizeBr.get(
        `/order/delivery/id/${orderId}`,
      );

      if (
        order.status === 'ACCEPT_DELIVERYMAN' ||
        order.status === 'RELEASE_SHOPPER' ||
        order.status === 'DELIVERY_ROUTE' ||
        order.status === 'FINISHED'
      ) {
        return job.stop();
      }

      const location = order.company.location.coordinates;

      const {data: deliveryMan} = await apiEconomizeBr.get(
        `/deliveryMan/search?lat=${location[1]}&lng=${location[0]}`,
      );

      if (deliveryMan[count]) {
        await db
          .ref()
          .child(`new/order?person=${deliveryMan[count].person}`)
          .push({
            message: 'Você tem pedido novo para entregar',
          });
        await apiEconomizeBr.put(`/order/status/${orderId}`, {
          deliveryMan: deliveryMan[count]._id,
          status: 'WAIT_DELIVERYMAN',
        });
        setTimeout(async () => {
          if (!database) {
            return;
          }
          return await database
            .ref()
            .child(`new/order?person=${deliveryMan[count].person}`)
            .remove();
        }, 2000);
      }

      return;
    } catch (err) {
      console.log(err);
      return;
    }
  },
};
