require("dotenv").config({ path: "./src/config/.env" });

const aws = require("aws-sdk");
const axios = require("axios");
const sharp = require("sharp");

module.exports = {
  key: 'CompressImg',
  async handle({ data }) {
    let params;
    const spaceEndPoint = new aws.Endpoint(`${process.env.S3_SPACES_URL}`);
    const s3 = new aws.S3({
      endpoint: spaceEndPoint,
      accessKeyId: `${process.env.S3_SPACES_KEY}`,
      secretAccessKey: `${process.env.S3_SPACES_SECRET}`,
    });
    const { imageProduct, oldFolder, newFolder } = data;
    const url = imageProduct.images[0];

    if (url.match(oldFolder)) {
      const name = url.split('.')[3].split('/')[2];
      const response = await axios.get(url, {
        responseType: "arraybuffer",
      });

      sharp(response.data)
        .resize(500)
        .toFormat('jpg')
        .toBuffer()
        .then(async (data) => {
          params = {
            Bucket: `${process.env.S3_SPACES_BUCKET_PRODUCTS}`,
            Key: `${newFolder}/${name}.jpg`,
            Body: Buffer.from(data, "base64"),
            ACL: "public-read",
            ContentEncoding: "base64",
            ContentType: `image/jpg`,
          };
          await s3.upload(params).promise();
        });
    }
  }
}
