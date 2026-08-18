const register = require('./RegisterController');
const create = require('./CreateController');
const list = require('./ListController');
const listPorNome = require('./ListPorNomeController');
const listPorCategory = require('./ListPorCategoryController');
const update = require('./UpdateController');
const remove = require('./DeleteController');

module.exports = {
    method: {
        register,
        create,
        list,
        listPorNome,
        listPorCategory,
        update,
        remove
    }
}
