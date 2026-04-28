

import express from "express";
import auth from "../middleware/auth.js";
import Wallet from "../models/Wallet.js";

const router = express.Router();


// =====================================
// GET LOGGED-IN USER WALLETS
// =====================================
router.get("/wallets", auth, async (req, res) => {
  try {
    const wallets = await Wallet.find({
      userId: req.user._id
    }).sort({ createdAt: 1 });

    res.json(wallets);

  } catch (err) {
    console.error("FETCH WALLETS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// =====================================
// ADD BALANCE TO WALLET
// =====================================
router.post("/wallets/add-balance", auth, async (req, res) => {
  try {
    const { symbol, amount } = req.body;

    // ✅ validation
    if (!symbol || amount === undefined) {
      return res.status(400).json({
        message: "symbol and amount are required"
      });
    }

    // ✅ find wallet
    const wallet = await Wallet.findOne({
      userId: req.user._id,
      symbol: symbol.trim()
    });

    if (!wallet) {
      return res.status(404).json({
        message: "Wallet not found"
      });
    }

    // ✅ convert amount to number
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        message: "Invalid amount"
      });
    }

    // ✅ add balance
    wallet.balance = Number(wallet.balance) + numAmount;

    await wallet.save();

    res.json({
      success: true,
      message: "Balance added successfully",
      wallet
    });

  } catch (err) {
    console.error("ADD BALANCE ERROR:", err);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

export default router;
