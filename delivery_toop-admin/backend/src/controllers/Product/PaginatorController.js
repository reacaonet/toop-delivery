const mongoose = require("mongoose");

const ProductModel = require("../../models/ProductModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, name, images, endPrice, startPrice, department } = req.query;
    const { company, companies = [] } = req;

    let filter = {};
    let or = [];
    // restringe os dados a nivel da franquia
    filter.company = { $in: companies.length > 0 ? companies : [company] };

    let list;
    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
        Error: dadosDoErro,
      });
    }

    if (name && name.trim().length > 0) {
      // filter.name = {
      //   $regex: '.*' + name.toLowerCase() + '.*',
      //   $options: 'i'
      // };

      or.push({
        name: { $regex: ".*" + name.toLowerCase() + ".*", $options: "i" },
      });

      or.push({
        barcode: { $regex: ".*" + name.toLowerCase() + ".*", $options: "i" },
      });
    }

    if (images && typeof images === "string" && images.trim().length > 0) {
      // all, withimages, withoutimages
      switch (images) {
        case "withimages":
          filter.images = {
            $exists: true,
            $ne: [],
          };
          break;
        case "withoutimages":
          filter.images = {
            $exists: true,
            $size: 0,
          };

          // or.push({
          //   images: {
          //     $eq: []
          //   }
          // });

          // filter.$or = [{
          //   images: {
          //     $exists: false
          //   }
          // }, {
          //   images: {
          //     $eq: []
          //   }
          // }]
          break;
        default:
          break;
      }
    }

    if (or.length > 0) {
      filter.$or = or;
    }

    if (startPrice && typeof startPrice === "string" && startPrice.trim().length > 0) {
      filter.price = {
        $gte: startPrice,
      };
    }

    if (endPrice && typeof endPrice === "string" && endPrice.trim().length > 0) {
      filter.price = {
        $lte: endPrice,
      };
    }

    filter.deletedAt = {
      $exists: false,
    };

    if (department) {
      filter.department = { $elemMatch: { $in: [mongoose.Types.ObjectId(department)] } };
    }

    list = await ProductModel.find(filter)
      .populate("company", {
        name: 1,
        cnpj: 1,
      })
      .populate("department", { name: 1 })
      .limit(parseInt(pageOut))
      .skip(parseInt(pageIn) * parseInt(pageOut))
      .lean();
    let numTotal = await ProductModel.find(filter).countDocuments();

    return res.status(200).json({
      list,
      total: numTotal,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Product/ListController.js',
    error: dadosDoErro?.message,
    method: 'ListController',
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
      message: "Falha ao encontrar Paginação",
      Error: dadosDoErro,
    });
  }
};
