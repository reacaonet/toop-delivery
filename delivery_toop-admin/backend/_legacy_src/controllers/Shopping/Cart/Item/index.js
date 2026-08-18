const create = require('./CreateController');
const list = require('./ListController');
const update = require('./UpdateController');
const remove = require('./DeleteController');
const shopperUpdate = require('./UpdateShopper');
const changeItem = require('./ChangeItemController');
const addItem = require('./AddItemController');
const showAll = require('./showAllController');

module.exports = {
  method: {
    create,
    list,
    update,
    remove,
    checkItem: shopperUpdate.checkItem,
    deleteItem: shopperUpdate.deleteItem,
    changeItem,
    addItem,
    showAll,
  }
}
