const SendImages = require("../services/sendImages");

const sendImage = async (req, res, next) => {
  try {
    const { file, folder } = req.body;

    if (file === "" || file === undefined) {
      return res.status(400).send({
        message: "Imagem não enviada",
      });
    }

    if (folder == "" || folder === undefined || folder.lenght <= 2) {
      return res.status(400).send({
        message: "Informe um nome de pasta válido",
      });
    }

    req.body.urlFile = await SendImages(file, folder);
    next();
  } catch (err) {
    console.log("oops fail im chatImageS3", err);

    return res
      .status(400)
      .json({
        message: "fail upload file",
        err: err.message,
      })
      .end();
  }
};

module.exports = sendImage;
