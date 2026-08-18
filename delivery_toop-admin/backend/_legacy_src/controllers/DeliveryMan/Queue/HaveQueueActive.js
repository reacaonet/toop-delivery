/** Model */
const QueueModel = require("../../../models/DeliveryMan/QueueDeliveryManModel");
// const OrderModel = require("../../../models/Shopping/order/orderStatusModel");
const LogModel = require("../../../models/LogModel");

const haveQueueActive = async (req, res) => {
  try {
    const { orderId } = req.params;

    const isActive = await QueueModel.findOne({
      order: orderId,
      status: "FINISH",
    })
      .select({
        order: 1,
        status: 1,
      })
      .populate({
        path: "order",
        select: {
          status: 1,
        },
      })
      .lean();

    let notFound = false;
    if (isActive && isActive.order && isActive.order.status === "WAIT_DELIVERYMAN") {
      notFound = true;
    }

    return res.status(200).send({
      notFound: notFound,
    });
  } catch (err) {
    await LogModel.create({
      path: '',
      error: err?.message,
      method: 'haveQueueActive',
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

    return res.status(400).send({
      message: "Não foi possível verificar",
    });
  }
};

module.exports = haveQueueActive;
