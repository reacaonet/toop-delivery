const aws = require("aws-sdk");
const fs = require("fs");
const LogModel = require("../../../models/LogModel");

const spaceEndPoint = new aws.Endpoint(`${process.env.S3_SPACES_URL}`);
const s3 = new aws.S3({
  endpoint: spaceEndPoint,
  accessKeyId: `${process.env.S3_SPACES_KEY}`,
  secretAccessKey: `${process.env.S3_SPACES_SECRET}`,
});

const sendFile = async (file_path, file_name, folder, req) => {
  try {
    // const nameUuid = uuidv4();
    const base64 = await fs.readFileSync(file_path);
    const type = file_name.split(".")[file_name.split(".").length - 1];

    const params = {
      Bucket: `${process.env.S3_SPACES_BUCKET_PRODUCTS}`,
      Key: `${folder}/${file_name}`,
      Body: base64,
      ACL: "public-read",
      ContentEncoding: "base64", // required
      ContentType: type !== "pdf" ? `image/${type}` : `application/pdf`,
    };

    const { Location } = await s3.upload(params).promise();

    fs.unlinkSync(file_path);

    return Location;
  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/v2/upload/sendFiles.js',
    error: err?.message,
    method: 'sendFile',
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

    console.log("Location Err", err);

    return null;
  }
};

module.exports = sendFile;
