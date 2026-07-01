import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists for custom designs
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const customDir = path.join(uploadDir, 'custom-coins');
if (!fs.existsSync(customDir)) {
  fs.mkdirSync(customDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, customDir),
  filename: (req, file, cb) => {
    const orderId = req.params.orderId || 'unknown';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `design-${orderId}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedExts = /png|pdf|svg/;
  const allowedMime = /image\/png|application\/pdf|image\/svg\+xml/;
  const extOk = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowedMime.test(file.mimetype);
  
  if (extOk && mimeOk) {
    return cb(null, true);
  }
  cb(new Error('Only PNG, SVG, or PDF files are allowed for custom designs'));
};

const customUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export default customUpload;
