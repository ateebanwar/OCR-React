import multer from 'multer';
import { config } from '../../config/index.js';

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/octet-stream', // Some browsers send octet-stream for PDFs
]);

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: config.maxUploadSizeBytes,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    // Sanitize filename to prevent directory traversal
    file.originalname = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');

    if (ALLOWED_MIME_TYPES.has(file.mimetype) || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed formats: PDF, XLSX, XLS, CSV.`));
    }
  },
});
