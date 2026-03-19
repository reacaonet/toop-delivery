const CreateController = require('./CreateController');
const UpdateController = require('./UpdateController');
const ListController = require('./ListController');

module.exports = {
  method: {
    create: CreateController().create,
    update: UpdateController().update,
    listOne: ListController().listOne,
  }
}
