const create = require('./CreateController');
const list = require('./ListController');
const remove = require('./DeleteController');
const search = require('./SearchController');
const update = require('./UpdateController');
const find = require('./FindController');

module.exports = {
  method: {
    create,
    list,
    remove,
    search,
    update,
    find,
  }
}
