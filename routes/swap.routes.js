import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";
import { getPrices, isPriceReady } from "../priceEngine.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const { fromAsset, toAsset, amount } = req.body;

  if (!isPriceReady()) {
    return res.status(400).json({ message: "Market loading..." });
  }

  const prices = getPrices();
  const user = await User.findById(req.user.id);

  if ((user.balance[fromAsset] || 0) < amount) {
    return res.status(400).json({ message: "Insufficient balance" });
  }

  const usd = amount * prices[fromAsset];
  const received = usd / prices[toAsset];

  user.balance[fromAsset] -= amount;
  user.balance[toAsset] += received;

  await user.save();

  res.json({
    success: true,
    received,
    balance: user.balance,
  });
});

export default router;
