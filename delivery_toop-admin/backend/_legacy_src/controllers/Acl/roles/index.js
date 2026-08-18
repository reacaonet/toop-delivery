const create = require('./CreateController');
const list = require('./ListController');
const paginator = require('./PaginatorController');
const listPorNome = require('./ListPorNomeController');
const remove = require('./DeleteController');
const update = require('./UpdateController');

module.exports = {
  method: {
    create,
    list,
    paginator,
    listPorNome,
    remove,
    update,
  }
}
