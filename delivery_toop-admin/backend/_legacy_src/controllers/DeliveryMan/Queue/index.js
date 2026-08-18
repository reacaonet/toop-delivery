const ListController = require("./ListController");
const UpdateStatus = require("./UpdateController");
const updateReceived = require("./UpdateNotificationReceived");
const BackToQueue = require("./BackToQueue");
const HaveQueueActive = require("./HaveQueueActive");

module.exports = {
  method: {
    list: ListController.list,
    statusOne: ListController.statusOne,
    updateStatus: UpdateStatus.updateStatus,
    updateReceived: updateReceived,
    updateDeliveryQueue: UpdateStatus.updateDeliveryQueue,
    backToQueue: BackToQueue,
    haveQueueActive: HaveQueueActive,
  },
};
