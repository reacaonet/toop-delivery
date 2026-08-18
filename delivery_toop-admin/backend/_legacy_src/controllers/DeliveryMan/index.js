const register = require('./RegisterController');
const create = require('./CreateController');
const list = require('./ListController');
const listDeliveryManOrderStatus = require('./ListDeliveryManOrderStatusController');
const deliveryPrice = require('./DeliveryPrice');
const paginator = require('./PaginatorController');
const update = require('./UpdateController');
const remove = require('./DeleteController');
const raceCanceled = require('./raceCanceledController');
const raceCanceledList = require('./raceCanceledListController');
const search = require('./searchController');
const updateLocation = require('./updateLocation');

// Race History
const raceHistory = require('./raceHistory/CreateController');

module.exports = {
  method: {
    register,
    create,
    list,
    deliveryPrice,
    paginator,
    update,
    remove,
    raceCanceled,
    raceCanceledList,
    raceHistory,
    search: search.search,
    searchOne: search.searchOne,
    listDeliveryManOrderStatus,
    updateLocation,
  }
}
