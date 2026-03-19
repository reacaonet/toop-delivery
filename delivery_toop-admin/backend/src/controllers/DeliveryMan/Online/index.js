const CreateController = require('./CreateController');
const UpdateStatus = require('./UpdateController');
const ListOnlineLastWeek = require('./ListOnlineLastWeekController');

module.exports = {
  method: {
    create: CreateController,
    update: UpdateStatus,
    ListOnlineLastWeek
  }
}
