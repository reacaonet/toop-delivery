const register = require('./CreateController');
const list = require('./ListController');
const update = require('./UpdateController');

module.exports = {
  method: {
    register: register.create,
    registerImage: register.createImage,
    list: list.list,
    noRead: list.noRead,
    updateRead: update.updateRead,
  }
}
