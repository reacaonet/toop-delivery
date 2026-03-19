const create = require('./CreateController');
const list = require('./ListController');
const listPorNome = require('./ListPorNomeController');
const treemodules = require('./TreeModulesController');
const paginator = require('./PaginatorController');
const remove = require('./DeleteController');
const update = require('./UpdateController');

module.exports = {
  method: {
    create,
    list,
    treemodules,
    listPorNome,
    paginator,
    update,
    remove
  }
}
