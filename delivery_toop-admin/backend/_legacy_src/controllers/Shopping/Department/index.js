const Create = require('./CreateController');
const List = require('./ListController');
const paginator = require('./PaginatorController');
const update = require('./UpdateController');
const remove = require('./DeleteController');

module.exports = {
  method: {
    create: Create.create,
    list: List.list,
    paginator,
    update,
    remove
  }
}
