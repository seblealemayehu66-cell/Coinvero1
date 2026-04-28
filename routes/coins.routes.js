import express from "express";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Example static prices (replace with real prices or API later)
const prices = {
  BTC: 30000,
  USDT: 1,
  ETH: 2000,
  BNB: 350
};

// GET all coins
router.get("/", authMiddleware, (req, res) => {
  res.json(prices);
});

export default router;