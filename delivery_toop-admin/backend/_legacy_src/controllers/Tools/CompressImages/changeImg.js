const ProductFood = require("../../../models/Food/ProductModel");
const LogModel = require("../../../models/LogModel");

const changeImg = async (req, res) => {
  try {
    req.setTimeout(0);

    const { oldFolder, newFolder } = req.body;
    const productFood = await ProductFood.find({
      images: {
        $exists: true,
      },
    });

    for await (const imageProduct of productFood) {
      const url = imageProduct.images[0];

      if (url.match(oldFolder)) {
        const oldType = url.split('.')[4];
        const newUrl = url.replace(oldFolder, newFolder).replace(oldType, 'jpg');
        await ProductFood.findByIdAndUpdate(imageProduct._id, {
          $set: {
            images: [newUrl],
          },
        });
      }
    }

    return res.status(200).send({
      data: "Troca de pasta realizada com sucesso!",
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Tools/CompressImages/changeImg.js',
      error: err?.message,
      method: 'changeImg',
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

module.exports = changeImg;
