const mongoose = require('mongoose');

module.exports = (req, res, next) => {
  try {
    let company = req.headers['company'];

    if (company === undefined || company === null && typeof token == "string" || !mongoose.Types.ObjectId.isValid(company)) {
      return res.status(401).json({
        success: false,
        message: 'The logged in user must be linked to a company. Required Header \'Company\''
      }).end();
    }
    req.company = company;
    next();
  } catch (err) {
    return res.status(501).json({
      message: 'The logged in user must be linked to a company. Required Header "Company"'
    }).end()
  }
}
