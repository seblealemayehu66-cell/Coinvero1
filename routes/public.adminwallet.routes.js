
import express from "express";
import AdminWallet from "../models/AdminWallet.js";

const router = express.Router();

/**
 * GET admin wallet info by coin symbol (public route)
 * Example: /api/public/adminwallets/BTC
 */
router.get("/adminwallets/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const wallet = await AdminWallet.findOne({ symbol });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Return only safe info
    res.json({
      coin: wallet.coin,
      symbol: wallet.symbol,
      network: wallet.network,
      address: wallet.address,
      qrCode: wallet.qrCode,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;