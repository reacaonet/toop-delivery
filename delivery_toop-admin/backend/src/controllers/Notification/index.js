const register = require('./RegisterController');
const create = require('./CreateController');
const list = require('./ListController');
const paginator = require('./PaginatorController');
const update = require('./UpdateController');
const remove = require('./DeleteController');

module.exports = {
    method: {
        register,
        create,
        list,
        paginator,
        update,
        remove
    }
}