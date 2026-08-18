const bycompany = require('./ByCompanyController');
const create = require('./CreateController');
const list = require('./ListController');
const listPorNome = require('./ListPorNomeController');
const update = require('./UpdateController');
const remove = require('./DeleteController');

module.exports = {
  method: {
    bycompany,
    create,
    listPorNome,
    list,
    update,
    remove
  }
}
