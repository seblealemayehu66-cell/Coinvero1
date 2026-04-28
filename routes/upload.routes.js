import express from "express";
import cloudinary from "../config/cloudinary.js";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image provided" });
      }

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "kyc_documents",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ message: "Upload failed" });
          }

          res.status(200).json({
            message: "Image uploaded",
            url: result.secure_url,
          });
        }
      );

      stream.end(req.file.buffer);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;