const aws = require('aws-sdk');
const {
  v4: uuidv4
} = require('uuid');
const spaceEndPoint = new aws.Endpoint(`${process.env.S3_SPACES_URL}`)
const s3 = new aws.S3({
  endpoint: spaceEndPoint,
  accessKeyId: `${process.env.S3_SPACES_KEY}`,
  secretAccessKey: `${process.env.S3_SPACES_SECRET}`
});

const sendImage = async (file, folder) => {
  try {
    const nameUuid = uuidv4();
    const base64 = file;
    const base64Data = new Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    const type = base64.split(';')[0].split('/')[1];

    const params = {
      Bucket: `${process.env.S3_SPACES_BUCKET_PRODUCTS}`,
      Key: `${folder}/${nameUuid}.${type}`,
      Body: base64Data,
      ACL: 'public-read',
      ContentEncoding: 'base64', // required
      ContentType: `image/${type}` // required. Notice the back ticks
    }

    const { Location } = await s3.upload(params).promise();
    return Location;
  } catch (err) {
    console.log('Location Err', err);
  }
}

module.exports = sendImage;
