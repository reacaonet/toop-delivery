const EcbrProductImage = require('../../../models/ProductDepartment/EcbrProductDepartment');
const LogModel = require("../../../models/LogModel");

const generateCode = async (req, res) => {
  try {

    const barcode = 'ECBR';

    let response = await EcbrProductImage.findOne({
      barcode: {
        $regex: '.*' + barcode + '.*', $options: 'i'
      }
    })
      .select({
        barcode: 1,
        createdAt: 1,
      })
      .sort({
        barcode: -1
      });

    let sequence = 'ECBR00000001';

    if (response) {
      let code = response.barcode;
      code = code.trim().replace('ECBR', '');
      code = Number(code) + 1;
      sequence = `ECBR${leftPad(code, 8)}`;
    }

    return res.status(200).send({
      sequence
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/EcbrBackImage/GenerateCodeController.js',
      error: err?.message,
      method: 'generateCode',
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
      message: 'Não foi possível gerar codigo',
      err: err.message,
    });
  }
}

function leftPad(value, totalWidth, paddingChar) {
  var length = totalWidth - value.toString().length + 1;
  return Array(length).join(paddingChar || '0') + value;
};

module.exports = generateCode;
