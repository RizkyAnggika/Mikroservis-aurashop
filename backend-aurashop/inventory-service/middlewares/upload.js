// middlewares/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ storage: multer.memoryStorage() });
module.exports = upload;

const uploadDir = path.resolve(__dirname, '..', 'uploads');

// pastikan folder ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    const base = path.basename(file.originalname || 'image', ext).replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ok = /image\/(png|jpg|jpeg|webp|gif)/.test(file.mimetype);
  cb(null, ok);
};

module.exports = multer({ storage: multer.memoryStorage() });
