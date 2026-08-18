const create = require('./CreateController');
const list = require('./ListController');
const paginator = require('./PaginatorController');
const update = require('./UpdateController');
const remove = require('./DeleteController');
const search = require('./SearchController');

module.exports = {
  method: {
    create,
    list,
    paginator,
    update,
    remove,
    search,
  }
}