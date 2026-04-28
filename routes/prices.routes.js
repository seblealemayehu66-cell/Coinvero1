
// prices.routes.js
import express from "express";
import fetch from "node-fetch"; 
// Node 22+ has fetch built-in, no need to install
const router = express.Router();

// Supported coins & metals
const COINS = ["BTC","ETH","USDT","SOL","BNB","ADA","XRP","DOT","DOGE","LTC","AVAX","SHIB","XAU","XAG"];

router.get("/", async (req, res) => {
  try {
    const prices = {};
    for (const coin of COINS) {
      if (coin === "USDT") {
        prices[coin] = 1;
      } else if (coin === "XAU" || coin === "XAG") {
        // Replace with your metals API key or static price if you want
        const metalPrices = { XAU: 1960, XAG: 24.5 }; // example
        prices[coin] = metalPrices[coin];
      } else {
        const r = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${coin}&tsyms=USDT`);
        const data = await r.json();
        prices[coin] = data.USDT;
      }
    }
    res.json(prices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch prices" });
  }
});

export default router;