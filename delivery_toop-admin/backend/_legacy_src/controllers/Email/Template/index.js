const create = require('./CreateController');
const list = require('./ListController');
const paginator = require('./PaginatorController');
const remove = require('./DeleteController');
const update = require('./UpdateController');

module.exports = {
  method: {
    create,
    list,
    paginator,
    remove,
    update,
  }
}
