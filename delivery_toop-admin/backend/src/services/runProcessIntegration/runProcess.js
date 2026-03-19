/** Model */
const Company = require('../../models/Company/CompanyModel');

/** Service */
const pratikoNewOrder = require('./pratiko/newOrder');

const runProcess = async (companyId, process, payload = {}) => {
  try {
    let company = await Company.findById(companyId)
      .select({
        cnpj: 1,
        runProcess: 1,
      })
      .lean();

      payload.company = company;

    if (
      !company ||
      !company.runProcess ||
      typeof company.runProcess !== 'object' ||
      company.runProcess .length <= 0
    ) {
      return true;
    }

    let runProcess = company.runProcess;
    let response = [];

    for await (const item of runProcess) {
      const isFind = item.process.findIndex(el => el === process);
      if (isFind > -1 ) {
        let resp = await executeProcess(item.service, payload);
        response.push(resp);
      }
    }

    return response;
  } catch (err) {
    return {
      status: false,
      message: err.message,
    };
  }
};


const executeProcess = async (serviceName, payload) => {
  switch (`${serviceName}`) {
    case 'pratikoNewOrder':
      return await pratikoNewOrder(payload);
    default:
     return true;
  }
}

module.exports = runProcess;
