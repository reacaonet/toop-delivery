const aws = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const multerS3 = require("multer-s3");

const spaceEndPoint = new aws.Endpoint(`${process.env.S3_SPACES_URL}`);
const s3 = new aws.S3({
  endpoint: spaceEndPoint,
  accessKeyId: `${process.env.S3_SPACES_KEY}`,
  secretAccessKey: `${process.env.S3_SPACES_SECRET}`,
});

module.exports = async (req, res, next) => {
  try {
    const { file, imageHeader, maker, files } = req.body;

    if (file !== "" && typeof file === "object") {
      await imageFile(req, file, "file");
    }

    // Quando enviado um array, exemplo:
    // [{ fileName: imagebase64 }]
    if (files && Array.isArray(files)) {
      try {
        for await (const fl of files) {
          if (fl !== '' && typeof fl === 'object') {
            await imageFile(req, fl.file, fl.name);
          }
        }
      } catch (err) {
        console.log('fail in space files', err);
      }
    }

    if (imageHeader !== "" && typeof imageHeader === "object") {
      console.log(" is imageHeader ...");
      await imageFile(req, imageHeader, "imageHeader");
    }

    if (maker !== "" && typeof maker === "object") {
      await imageFile(req, maker, "maker");
    }

    next();
  } catch (err) {
    return res
      .status(501)
      .json({
        message: "123 error in upload file",
        err,
      })
      .end();
  }
};

const imageFile = async (req, file, name = "file") => {
  try {
    if (!Array.isArray(file)) {
      return;
    }

    let promises = await file.map(async (item, index) => {
      const nameUuid = uuidv4();
      const base64 = item.base64;
      const extras = item.extras;

      const base64Buffer = base64.replace(/^data:image\/\w+;base64,/, "").replace(/^data:application\/\w+;base64,/, "");

      const base64Data = new Buffer.from(base64Buffer, "base64");
      // Getting the file type, ie: jpeg, png or gif
      const type = base64.split(";")[0].split("/")[1];

      const params = {
        Bucket: `${process.env.S3_SPACES_BUCKET_PRODUCTS}`,
        Key: `${process.env.S3_SPACES_BUCKET_PRODUCTS_FOLDER}/${nameUuid}.${type}`,
        Body: base64Data,
        ACL: "public-read",
        ContentEncoding: "base64", // required
        ContentType: type !== "pdf" ? `image/${type}` : `application/pdf`, // required. Notice the back ticks
      };

      const { Location, Key } = await s3.upload(params).promise();

      req.body[name] = !req.body[name] ? [] : req.body[name];
      req.body[name][index] = !req.body[name][index]
        ? []
        : req.body[name][index];

      req.body[name][index].url = Location;
      req.body[name][index].base64 = Key;

      if (extras) {
        req.body[name][index].extras = extras;
      }

      return Location;
    });

    // Finaliza middleware após enviar todas as imagens
    await Promise.all(promises).then();
  } catch (error) {
    console.log(error);
  }
};
