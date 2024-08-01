const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    key: function (req, file, cb) {
      cb(null, file.originalname);
    }
  })
});

module.exports = (req, res) => {
  upload.single('file')(req, res, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(200).json({ message: 'File uploaded successfully', fileName: req.file.originalname });
  });
};
