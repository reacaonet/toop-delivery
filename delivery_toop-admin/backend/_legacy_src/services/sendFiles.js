const aws = require("aws-sdk");
const fs = require("fs");

const { v4: uuidv4 } = require("uuid");
const spaceEndPoint = new aws.Endpoint(`${process.env.S3_SPACES_URL}`);
const s3 = new aws.S3({
  endpoint: spaceEndPoint,
  accessKeyId: `${process.env.S3_SPACES_KEY}`,
  secretAccessKey: `${process.env.S3_SPACES_SECRET}`,
});

const sendFile = async (file_path, file_name, folder) => {
  try {
    const nameUuid = uuidv4();
    const base64 = await fs.readFileSync(file_path);

    const type = file_name.split(".")[file_name.split(".").length - 1];

    const params = {
      Bucket: `${process.env.S3_SPACES_BUCKET_PRODUCTS}`,
      Key: `${folder}/${file_name}`,
      Body: base64,
      ACL: "public-read",
      ContentEncoding: "base64", // required
      ContentType: `image/${type}`, // required. Notice the back ticks
    };

    const { Location } = await s3.upload(params).promise();

    fs.unlinkSync(file_path);

    return Location;
  } catch (err) {
    console.log("Location Err", err);
  }
};

module.exports = sendFile;
