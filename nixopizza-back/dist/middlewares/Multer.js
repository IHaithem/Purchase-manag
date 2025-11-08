"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const UPLOAD_BASE_DIR = path_1.default.resolve("src/uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const imageFileFilter = (_req, file, cb) => {
    const allowedExt = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"];
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    const isImage = file.mimetype.startsWith("image/");
    if (isImage && allowedExt.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error("Only valid image files are allowed"));
    }
};
const upload = (directory = "") => {
    const storage = multer_1.default.diskStorage({
        destination: (_req, _file, cb) => {
            const subDir = path_1.default.join(UPLOAD_BASE_DIR, directory);
            if (!fs_1.default.existsSync(subDir)) {
                fs_1.default.mkdirSync(subDir, { recursive: true });
            }
            cb(null, subDir);
        },
        filename: (_req, file, cb) => {
            const timestamp = Date.now();
            const ext = path_1.default.extname(file.originalname).toLowerCase();
            const baseName = path_1.default
                .basename(file.originalname, ext)
                .replace(/[^a-zA-Z0-9_-]/g, "")
                .toLowerCase();
            cb(null, `${baseName}_${timestamp}${ext}`);
        },
    });
    return (0, multer_1.default)({
        storage,
        fileFilter: imageFileFilter,
        limits: { fileSize: MAX_FILE_SIZE },
    });
};
exports.upload = upload;
//# sourceMappingURL=Multer.js.map