const create = require('./CreateController');
const paginator = require('./PaginatorController');
const list = require('./ListController');
const listPorNome = require('./ListPorNomeController');
const update = require('./UpdateController');
const remove = require('./DeleteController');

module.exports = {
    method: {
        create,
        list,
        paginator,
        listPorNome,
        update,
        remove
    }
}
