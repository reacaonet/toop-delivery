const mongoose = require('mongoose')

/** Model */
const EcbrImageBank = require('../../../models/ProductDepartment/EcbrProductDepartment');
const LogModel = require("../../../models/LogModel");

/**
 * GET
 * URL - /v2/ecbr-image-bank
 * Params GET
 *  - page (Optional | Number)
 *  - limit (Optional | Number)
 *  - barcode (Optional | Number)
 *  - name (Optional | String)
 *  - isCopyright (Optional | true | false)
 *  - isImages (Optional | true | false)
 *  - isDepartments (Optional | true | false)
 *  - status (Optional | true | false)
 */
const list = async (req, res) => {
  try {
    const {
      page,
      limit,
      barcode,
      isCopyright,
      isImages,
      isDepartments,
      status,
      name,
      audited,
      company
    } = req.query;

    let total = 0;
    let totalPage = 0;
    let nPerPage = 50;
    let pageNumber = 1;
    let or = [];

    if (page && page > 0) {
      pageNumber = Number(`${page}`);
    }

    if (limit && limit > 0) {
      nPerPage = Number(`${limit}`);
    }

    let aggregate = [];
    let match = {};

    // Filtro
    if (barcode && `${barcode}`.length >= 2) {
      or.push({
        barcode: {
          $regex: '.*' + barcode.trim() + '.*', $options: 'i'
        }
      });

      // match.barcode = {
      //   $regex: '.*' + barcode.trim() + '.*', $options: 'i'
      // }
    }

    if (name && `${name}`.length >= 2) {
      or.push({
        name: {
          $regex: '.*' + name.trim() + '.*', $options: 'i'
        }
      });

      // match.name = {
      //   $regex: '.*' + name.trim() + '.*', $options: 'i'
      // }
    }

    if (or && or.length > 0) {
      match.$or = or;
    }

    if (`${isCopyright}` === 'true' || `${isCopyright}` === 'false') {
      match.copyright = Boolean(`${isCopyright}`);
    }

    if (`${status}` === 'true' || `${status}` === 'false') {
      match.status = Boolean(`${status}`);
    } else {
      match.status = true;
    }

    if (`${isImages}` === 'true') {
      match.images = {
        $exists: true,
        $not: { $size: 0 }
      }
    } else if (`${isImages}` === 'false') {
      match.images = {
        $exists: true,
        $size: 0
      }
    }

    if (`${isDepartments}` === 'true') {
      match.departments = {
        $exists: true,
        $not: { $size: 0 }
      };
    } else if (`${isDepartments}` === 'false') {
      match.departments = {
        $exists: true,
        $size: 0
      }
    }

    if (`${audited}` === 'true' || `${audited}` === 'false') {
      match.audited = `${audited}` === 'true' ? true : false
    }

    if (company) {
      match.companyAdded = mongoose.Types.ObjectId(company)
    }

    aggregate.push({ $match: match });

    aggregate.push({
      $lookup: {
        from: 'department',
        let: { departments: "$departments" },
        as: "departments",
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", "$$departments"] },
            }
          },
          {
            $project: {
              _id: 0,
              name: 1,
            }
          }
        ]
      }
    });

    aggregate.push({
      $project: {
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      }
    });

    aggregate.push({ $skip: pageNumber > 0 ? ((pageNumber - 1) * nPerPage) : 0 });
    aggregate.push({ $limit: nPerPage });


    const response = await EcbrImageBank.aggregate(aggregate);


    /** Total */
    let totalResponse = await EcbrImageBank.aggregate([
      {
        $match: match,
      },
    ]).count('total');

    if (totalResponse && totalResponse.length > 0 && totalResponse[0].total) {
      total = totalResponse[0].total;
      totalPage = Math.ceil(total / nPerPage);
    }

    let list = {};
    list.response = response;

    list.pagination = {
      page: pageNumber,
      limit: nPerPage,
    }

    list.total = {
      documents: total,
      pages: totalPage
    };

    return res.status(200).send(list);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/EcbrBackImage/ListController.js',
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

    console.log('err', err.message);
    return res.status(400).send({
      message: 'Não foi possível listar',
      err: err.message,
    });
  }
};

module.exports = list;
