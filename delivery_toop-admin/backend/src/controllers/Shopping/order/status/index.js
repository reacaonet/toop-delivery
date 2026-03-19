const ListController = require("./ListController");
const UpdateController = require("./UpdateController");
const listCancelledOrder = require("../Cancelled/listCancelledController");

module.exports = {
  method: {
    currentOrder: ListController.currentOrder,
    listOrder: ListController.list,
    listCancelledOrder: listCancelledOrder.list,
    listDelivery: ListController.listDelivery,
    listDeliveryMan: ListController.listDeliveryMan,
    listOne: ListController.listDeliveryOne,
    listOneCron: ListController.listOneCron,
    changeStatus: UpdateController.updateStatus,
    listOrderCustomer: ListController.listOrderCustomer,
  },
};
