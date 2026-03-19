/* Model */
const DepartmentMob = require("../../../models/Shopping/DepartmentModelMobile");
const EcbrDepartment = require("../../../models/ProductDepartment/EcbrProductDepartment");
const CompanyModel = require("../../../models/Company/CompanyModel");
const LogModel = require("../../../models/LogModel");

const list = async (req, res) => {
  try {
    const { barcode, all, franchise, company } = req.query;

    let filter = {};
    let resultBarCode = [];
    let or = [];

    if (franchise) {
      or.push({
        franchise: franchise,
      });

      or.push({
        franchise: {
          $exists: false,
        },
      });
    } else if (company) {
      const respCompany = await CompanyModel.findOne({
        _id: company,
      })
        .select({
          franchise: 1,
        })
        .lean();

      if (respCompany && respCompany.franchise) {
        or.push({
          franchise: respCompany.franchise,
        });
      }

      or.push({
        company: company,
      });

      or.push({
        franchise: {
          $exists: false,
        },
      });
    }

    if (or.length > 0) {
      filter.$or = or;
    }

    filter.deletedAt = {
      $exists: false,
    };

    if (barcode && barcode !== null && barcode !== undefined) {
      let strBarcode = getBarcode(barcode);

      let list = await EcbrDepartment.findOne({
        barcode: strBarcode,
      }).lean();

      if (list && list.departments && list.departments.length > 0) {
        list.departments.map(item => {
          resultBarCode.push({ _id: item });
        });
      }

      if (resultBarCode.length > 0) {
        return res.status(200).send(resultBarCode);
      }
    }

    if (all) {
      let response = await DepartmentMob.find(filter);
      return res.status(200).send(response);
    }


    const listDepartments = await DepartmentMob.find(filter);
    return res.status(200).send(listDepartments);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/DepartmentMobile/ListController.js',
      error: err?.message,
      method: 'list',
      type: 'error',
      level: 0,
      origin: 'backend',
      request: {
        application: req?.application,
        franchise: req?.franchise,
        company: req?.company,
        params: req?.params,
        body: req?.body,
        query: req?.query,
        heders: req?.heders,
        method: req?.method,
        url: req?.url,
      },
    });

    console.log(`Log de erro criado com sucesso.`);

    return res.status(400).send({
      message: "Falha ao listar Departamentos",
      error: err.message,
    });
  }
};

const getBarcode = barcode => {
  try {
    let totalZero = 0;
    let disableSum = false;
    let strBarcode = barcode;

    Array.prototype.map.call(barcode, char => {
      if (char == 0 && disableSum === false) {
        totalZero += 1;
      } else if (char != 0) {
        disableSum = true;
      }
    });

    if (totalZero >= 2 && totalZero <= 5) {
      strBarcode = barcode.substring(totalZero);
    }

    return strBarcode.trim();
  } catch (err) {
    return barcode;
  }
};

module.exports = { list };
