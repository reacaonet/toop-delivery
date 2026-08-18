const create = require('./CreateController');
const list = require('./ListController');
const paginator = require('./PaginatorController');
const remove = require('./DeleteController');
const update = require('./UpdateController');
const listSegment = require('./ListCategory')
const listOne = require('./ListOne')

module.exports = {
  method: {
    list,
    paginator,
    create,
    update,
    remove,
    listCategory: listSegment.listCategory,
    listCompanyCategory: listSegment.listCompanyCategory,
    segmentoToFranchise: listSegment.franchiseSegment,
    listOne
  }
}
