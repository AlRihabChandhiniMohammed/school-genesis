import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`),
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(pdf|doc|docx|txt|zip|jpg|png|pptx|xlsx)$/i;
    cb(null, allowed.test(file.originalname));
  },
});

export const serveUploads = (req, res, next) => {
  res.sendFile(path.join(uploadDir, req.params.file), (err) => {
    if (err) res.status(404).json({ error: 'File not found' });
  });
};
