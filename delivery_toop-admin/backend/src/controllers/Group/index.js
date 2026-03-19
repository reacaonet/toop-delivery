const register = require('./RegisterController');
const create = require('./CreateController');
const list = require('./ListController');
const paginator = require('./PaginatorController');
const listPorNome = require('./ListPorNomeController');
const update = require('./UpdateController');
const remove = require('./DeleteController');

module.exports = {
    method: {
        register,
        create,
        list,
        paginator,
        listPorNome,
        update,
        remove
    }
}
