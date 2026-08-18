const register = require('./RegisterController');
const create = require('./CreateController');
const list = require('./ListController');
const update = require('./UpdateController');
const remove = require('./DeleteController');

module.exports = {
    method: {
        register,
        create,
        list,
        update,
        remove
    }
}