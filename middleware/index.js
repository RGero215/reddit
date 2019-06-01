var path = require('path');
var crypto = require('crypto');
var multer = require('multer');
var GridFsStorage = require('multer-gridfs-storage');
var mongoURI = 'mongodb://localhost/reddit-db'

// Create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
});
const upload = multer({ storage });

module.exports.upload = upload;
