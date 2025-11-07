"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const deleteImage = (relativePath) => {
    const fullPath = path_1.default.resolve("src" + relativePath);
    if (fs_1.default.existsSync(fullPath)) {
        fs_1.default.unlink(fullPath, (err) => {
            if (err) {
                console.error(`❌ Error deleting file: ${fullPath}`, err);
            }
            else {
                console.log(`🗑️ Deleted image: ${relativePath}`);
            }
        });
    }
    else {
        console.warn(`⚠️ File not found: ${relativePath}`);
    }
};
exports.deleteImage = deleteImage;
//# sourceMappingURL=Delete.js.map