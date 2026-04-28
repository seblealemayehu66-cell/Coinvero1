import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import Wallet from "../models/Wallet.js";

const router = express.Router();

router.post("/add-balance", adminAuth, async (req, res) => {
  const { userId, symbol, amount } = req.body;

  const wallet = await Wallet.findOne({ userId, symbol });

  if (!wallet)
    return res.status(404).json({ message: "Wallet not found" });

  wallet.balance += Number(amount);
  await wallet.save();

  res.json({
    message: "Balance updated",
    wallet
  });
});

export default router;