const mongoose = require("mongoose");

/** Model */
const Product = require("../../models/ProductModel");
const Department = require("../../models/Shopping/DepartmentModel");
const LogModel = require("../../models/LogModel");

const limitPage = 5;

module.exports = async (req, res) => {
  try {
    const company = req.params.id;
    const { department, departmentPage, page, limit } = req.query;

    let resp = [];

    if (department && page) {
      resp = await nextProducts(company, mongoose.Types.ObjectId(department), page);
    } else {
      resp = await departmentProducts(company, departmentPage, limit);
    }

    return res.json(resp);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Product/DepartmentController.js',
      error: err?.message,
      method: 'DepartmentController',
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
      mesage: "Falha ao encontrar Produto",
      error: err.message,
    });
  }
};

const departmentProducts = async (company, departmentPage, limit) => {
  try {
    const setLimit = parseInt(limit) || 5;
    const setPage = parseInt(departmentPage) - 1;

    const config = [
      {
        $match: {
          status: true,
          showInApp: true,
        },
      },
      {
        $lookup: {
          from: "sortDepartment",
          as: "sortDepartment",
          let: { id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$department", "$$id"] },
              },
            },
            {
              $project: {
                order: 1,
              },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      {
        $unwind: { path: "$sortDepartment", preserveNullAndEmptyArrays: true },
      },
      {
        $sort: {
          "sortDepartment.order": 1,
        },
      },
      {
        $project: {
          _id: {
            $toString: "$_id",
          },
          sortDepartment: 1,
          name: 1,
          products: 1,
        },
      },
      {
        $lookup: {
          from: "product",
          as: "products",
          let: {
            companyId: mongoose.Types.ObjectId(company),
            departmentid: "$_id",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  { $expr: { $eq: ["$company", "$$companyId"] } },
                  {
                    $expr: {
                      $in: [{ $toObjectId: "$$departmentid" }, "$department"],
                    },
                  },
                ],
              },
            },

            {
              $project: {
                keywords: 1,
                unity: 1,
                maximumAmount: 1,
                images: 1,
                active: 1,
                department: 1,
                _id: 1,
                name: 1,
                description: 1,
                barcode: 1,
                price: 1,
                barcodeBox: 1,
                pricePromotion: 1,
                dateStart: { $divide: [{ $subtract: ["$dateInitPricePromotion", "$$NOW"] }, 3600000] },
                dateEnd: { $divide: [{ $subtract: ["$dateFinishPricePromotion", "$$NOW"] }, 3600000] },
                dateInitPricePromotion: 1,
                dateFinishPricePromotion: 1,
                company: 1,
                createdAt: 1,
                updatedAt: 1,
              },
            },

            {
              $project: {
                keywords: 1,
                unity: 1,
                maximumAmount: 1,
                images: 1,
                active: 1,
                department: 1,
                _id: 1,
                name: 1,
                description: 1,
                barcode: 1,
                price: 1,
                barcodeBox: 1,
                pricePromotion: {
                  $cond: {
                    if: {
                      $and: [{ $lte: ["$dateStart", 0] }, { $gte: ["$dateEnd", 0] }],
                    },
                    then: "$pricePromotion",
                    else: 0,
                  },
                },
                dateInitPricePromotion: 1,
                dateFinishPricePromotion: 1,
                company: 1,
                createdAt: 1,
                updatedAt: 1,
              },
            },
            { $limit: limitPage },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          sortDepartment: 1,
          products: 1,
          numberProducts: { $cond: { if: { $isArray: "$products" }, then: { $size: "$products" }, else: 0 } },
        },
      },
      {
        $match: {
          numberProducts: { $gt: 0 },
        },
      },
      { $skip: setPage * setLimit },
    ];

    const totalProductDepartments = await Department.aggregate(config).limit(setLimit);
    const productDepartments = await Department.aggregate(config);

    let numTotal = totalProductDepartments.length;
    let pages = Math.ceil(numTotal / setLimit);

    return {
      list: productDepartments,
      numTotal,
      pages,
    };
  } catch (err) {
    console.log("Error ", err);
    return [];
  }
};

const nextProducts = async (company, department, page) => {
  try {
    let products = await Product.aggregate([
      {
        $match: {
          company: mongoose.Types.ObjectId(company),
          department: {
            $in: [department],
          },
        },
      },
      {
        $project: {
          keywords: 1,
          unity: 1,
          maximumAmount: 1,
          images: 1,
          active: 1,
          department: 1,
          _id: 1,
          name: 1,
          description: 1,
          barcode: 1,
          price: 1,
          barcodeBox: 1,
          pricePromotion: 1,
          dateStart: { $divide: [{ $subtract: ["$dateInitPricePromotion", "$$NOW"] }, 3600000] },
          dateEnd: { $divide: [{ $subtract: ["$dateFinishPricePromotion", "$$NOW"] }, 3600000] },
          dateInitPricePromotion: 1,
          dateFinishPricePromotion: 1,
          company: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },

      {
        $project: {
          keywords: 1,
          unity: 1,
          maximumAmount: 1,
          images: 1,
          active: 1,
          department: 1,
          _id: 1,
          name: 1,
          description: 1,
          barcode: 1,
          price: 1,
          barcodeBox: 1,
          pricePromotion: {
            $cond: {
              if: {
                $and: [{ $lte: ["$dateStart", 0] }, { $gte: ["$dateEnd", 0] }],
              },
              then: "$pricePromotion",
              else: 0,
            },
          },
          dateInitPricePromotion: 1,
          dateFinishPricePromotion: 1,
          company: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ])
      .skip(parseInt(`${page}`) * limitPage)
      .limit(limitPage);

    return products;
  } catch (err) {
    return [];
  }
};
