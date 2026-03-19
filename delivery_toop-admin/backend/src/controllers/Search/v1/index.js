const list = require("./ListController");
const listForSegments = require('./SegmentsController')

module.exports = {
  method: {
    list,
    listForSegments
  },
};
