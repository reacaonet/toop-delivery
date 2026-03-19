const create = require('./CreateController');
const listByName = require('./ListByName');
const list = require('./ListController');
const only = require('./onlyController');
const update = require('./UpdateController');
const remove = require('./DeleteController');
const sortUpdate = require('./SortUpdateController');
const statusUpdate = require('./StatusUpdateController');

module.exports = {
  method: {
    create,
    listByName,
    list,
    only,
    update,
    remove,
    sortUpdate,
    statusUpdate
  }
}
