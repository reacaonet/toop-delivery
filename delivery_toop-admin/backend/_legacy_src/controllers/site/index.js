const paginator = require('./PaginatorController');
const create = require('./CreateController');
const list = require('./ListController');
const update = require('./UpdateController');
const remove = require('./DeleteController');

module.exports = {
    method: {
      paginator,
        create,
        list,
        update,
        remove
    }
}