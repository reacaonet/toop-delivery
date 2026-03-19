const Transactions = require('./Transactions');
const Sales = require('./Sales');
const Capture = require('./Capture');
const Subordinates = require('./Subordinates');

function Braspag() {
  return {
    transactions: Transactions,
    sales: Sales,
    capture: Capture,
    subordinates: Subordinates,
  }
}

module.exports = Braspag;
