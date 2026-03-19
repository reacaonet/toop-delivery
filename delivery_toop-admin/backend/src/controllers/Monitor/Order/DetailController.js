function DetailController() {
  const Order = require("../../../models/Shopping/order/orderStatusModel");
  const mongoose = require("mongoose");
  const queue = require("../../../models/DeliveryMan/QueueDeliveryManModel");
  const DeliveryMan = require("../../../models/DeliveryMan/DeliveryManModel");
  const LogModel = require("../../../models/LogModel");

  async function detail(req, res) {
    try {
      const { orderId } = req.params;

      if (!orderId || !mongoose.isValidObjectId(orderId)) {
        return res.status(400).send({
          message: "Informe um pedido válido",
        });
      }

      let orderRequest = await Order.findById(orderId)
        .populate("company", { name: 1, images: 1 })
        .populate({
          path: "customer",
          select: { email: 1, person: 1 },
          populate: {
            path: "person",
            select: { name: 1 },
          },
        })
        .populate("CustomerDeliveryAddress", { address: 1 })
        .populate("payment", {
          total: 1,
          totalCompany: 1,
          priceDelivery: 1,
          serviceCharge: 1,
        })
        .populate({
          path: "shopper",
          select: { person: 1 },
          populate: {
            path: "person",
            select: { name: 1 },
          },
        })
        .populate({
          path: "deliveryMan",
          select: {
            status: 1,
            phone: 1,
            location: 1,
            person: 1,
          },
          populate: {
            path: "person",
            select: { name: 1 },
          },
        })
        .lean();

      if (!orderRequest || !orderRequest.status) {
        return res.status(400).send({
          message: "Não conseguimos identificar o Pedido",
        });
      }

      orderRequest = await queueDeliveryMan(orderRequest);

      return res.status(200).send(orderRequest);
    } catch (err) {
      await LogModel.create({
        path: 'src/controllers/Monitor/Order/DetailController.js',
        error: err?.message,
        method: 'detail',
        type: 'error',
        level: 0,
        origin: 'backend',
        request: {
          application: req?.application,
          franchise: req?.franchise,
          company: req?.company,
          params: req?.params,
          body: req?.body,
          query: req?.query,
          heders: req?.heders,
          method: req?.method,
          url: req?.url,
        },
      });

      console.log(`Log de erro criado com sucesso.`);

      // console.log('Error', err);
      return res.status(400).send({
        message: "Fail process list",
      });
    }
  }

  async function queueDeliveryMan(order) {
    try {
      let response = await queue.findOne({ order: order._id });
      if (!response && response._id) {
        return order;
      }

      let historyDelivery = response.historicDeliveryMan;

      if (historyDelivery && historyDelivery.length > 0) {
        let deliveries = await DeliveryMan.find({
          _id: {
            $in: historyDelivery,
          },
        })
          .populate("person", { name: 1 })
          .lean();

        order.deliveriesMan = deliveries;
      }

      return order;
    } catch (err) {
      return order;
    }
  }

  return {
    detail,
  };
}

module.exports = DetailController;
