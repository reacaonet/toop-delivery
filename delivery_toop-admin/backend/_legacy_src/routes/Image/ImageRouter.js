const uploadFile = require("../../controllers/Image/ImageUploadController");
const s3Spaces = require("../../middleware/spacesS3");

const imageRoute = require("express").Router();

imageRoute.post("/fileUpload", s3Spaces, uploadFile);

module.exports = imageRoute;
