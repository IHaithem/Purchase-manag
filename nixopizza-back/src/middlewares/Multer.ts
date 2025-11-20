import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

interface FileValidationRequest extends Request {
  fileValidationError?: string;
}

// Memory storage so it works on Vercel (no local disk writes)
const storage = multer.memoryStorage();

// Base upload instance
const baseUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req: FileValidationRequest, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
      req.fileValidationError = "Invalid file type";
      return cb(null, false);
    }
    cb(null, true);
  },
});

/**
 * Backwards compatible function signature so existing code that did upload("categories")
 * does not crash. We ignore the folder argument now because we use blob storage.
 */
export const upload = (/* _folder?: string */) => baseUpload;