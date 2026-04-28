import express from "express";
import AdminWallet from "../models/AdminWallet.js";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/upload.js"; // multer
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

/**
 * ADD WALLET
 * Admin can add a new wallet with coin, symbol, network, address, qrCode image
 */
router.post(
  "/adminwallets",
  adminAuth,
  upload.single("image"), // expect image file with field name 'image'
  async (req, res) => {
    try {
      const { coin, symbol, network, address } = req.body;

      if (!coin || !symbol || !network || !address) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      let qrCodeUrl = "";
      if (req.file) {
        qrCodeUrl = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "admin_wallets",
              resource_type: "image",
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            }
          );
          stream.end(req.file.buffer);
        });
      }

      const wallet = await AdminWallet.create({
        coin,
        symbol,
        network,
        address,
        qrCode: qrCodeUrl,
      });

      res.status(201).json({ success: true, wallet });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * UPDATE WALLET
 */
router.put("/adminwallets/:id", adminAuth, async (req, res) => {
  try {
    const { coin, symbol, network, address, qrCode } = req.body;

    const wallet = await AdminWallet.findByIdAndUpdate(
      req.params.id,
      { coin, symbol, network, address, qrCode },
      { new: true }
    );

    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    res.json({ success: true, wallet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE WALLET
 */
router.delete("/adminwallets/:id", adminAuth, async (req, res) => {
  try {
    await AdminWallet.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Wallet deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET ALL WALLETS (ADMIN)
 */
router.get("/adminwallets", adminAuth, async (req, res) => {
  try {
    const wallets = await AdminWallet.find().sort({ createdAt: -1 });
    res.json(wallets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET WALLET BY SYMBOL (for user page)
 */
router.get("/adminwallets/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const wallet = await AdminWallet.findOne({ symbol });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    res.json(wallet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET all admin wallets for users (public)
 */
router.get("/user/adminwallets", async (req, res) => {
  try {
    const wallets = await AdminWallet.find().sort({ createdAt: -1 });
    res.json(wallets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;