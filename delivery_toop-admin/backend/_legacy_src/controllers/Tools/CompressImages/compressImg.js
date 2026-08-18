require("dotenv").config({ path: "./src/config/.env" });

const Queue = require("../../../config/queue");
const ProductFood = require("../../../models/Food/ProductModel");
const LogModel = require("../../../models/LogModel");

const compressImg = async (req, res) => {
  try {
    const { oldFolder, newFolder } = req.body;
    const productFood = await ProductFood.find({
      images: {
        $exists: true,
      },
    });

    for await (const imageProduct of productFood) {
      await Queue.add("CompressImg", { imageProduct, oldFolder, newFolder });
    }

    return res.status(200).send({
      data: "Fila de compress das imagens feita com sucesso!",
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Tools/CompressImages/compressImg.js',
      error: err?.message,
      method: 'compressImg',
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
      err,
    });
  }
};

module.exports = compressImg;
