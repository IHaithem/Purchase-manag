import express from "express";
import multer from "multer";
import crypto from "crypto";
import { uploadBufferToBlob } from "../utils/blob";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB - adjust as needed
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });

    const ext = (req.file.originalname.match(/\.[^/.]+$/) || [".bin"])[0];
    const unique = crypto.randomBytes(8).toString("hex");
    const key = `${Date.now()}-${unique}${ext}`;

    const { url, key: storedKey } = await uploadBufferToBlob(key, req.file.buffer, req.file.mimetype);

    // Save `url` or `storedKey` in DB if you need to associate with records.
    res.json({ url, key: storedKey });
  } catch (err: any) {
    console.error("Blob upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;