import express from "express";
import axios from "axios";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/* ================= PRICE CACHE ================= */
let cachedPrices = null;
let lastFetch = 0;

async function getPrices() {
  const now = Date.now();

  // Cache prices for 30 seconds
  if (cachedPrices && now - lastFetch < 30000) {
    return cachedPrices;
  }

  try {
    const prices = {};

    /* ===== CRYPTO (CoinGecko) ===== */
    const cryptoRes = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "bitcoin,ethereum,tether,solana",
          vs_currencies: "usd",
        },
      }
    );

    prices.BTC = cryptoRes.data.bitcoin.usd;
    prices.ETH = cryptoRes.data.ethereum.usd;
    prices.SOL = cryptoRes.data.solana.usd;
    prices.USDT = 1;

    /* ===== METALS (GoldAPI) ===== */
    const goldRes = await axios.get("https://www.goldapi.io/api/XAU/USD", {
      headers: {
        "x-access-token": process.env.GOLD_API_KEY,
      },
    });

    const silverRes = await axios.get("https://www.goldapi.io/api/XAG/USD", {
      headers: {
        "x-access-token": process.env.GOLD_API_KEY,
      },
    });

    prices.XAU = goldRes.data.price;
    prices.XAG = silverRes.data.price;

    cachedPrices = prices;
    lastFetch = now;

    console.log("LIVE PRICES:", prices);

    return prices;
  } catch (err) {
    console.error("Price Fetch Error:", err.response?.data || err.message);
    throw new Error("Failed to fetch live prices");
  }
}

/* ================= SWAP ================= */
router.post("/swap", authMiddleware, async (req, res) => {
  try {
    const { fromAsset, toAsset, amount } = req.body;

    if (!fromAsset || !toAsset || !amount)
      return res.status(400).json({ message: "Missing data" });

    if (fromAsset === toAsset)
      return res.status(400).json({ message: "Cannot swap same asset" });

    if (Number(amount) <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.balance[fromAsset] || user.balance[fromAsset] < amount)
      return res.status(400).json({ message: "Insufficient balance" });

    const prices = await getPrices();

    if (!prices[fromAsset] || !prices[toAsset])
      return res.status(400).json({ message: "Invalid asset" });

    /* ===== UNIVERSAL CONVERSION ===== */
    const usdValue = amount * prices[fromAsset];
    const receiveAmount = usdValue / prices[toAsset];

    user.balance[fromAsset] -= amount;
    user.balance[toAsset] =
      (user.balance[toAsset] || 0) + receiveAmount;

    await user.save();

    res.json({
      success: true,
      received: receiveAmount,
      rate: prices[fromAsset] / prices[toAsset],
      balance: user.balance,
    });
  } catch (err) {
    console.error("Swap Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;