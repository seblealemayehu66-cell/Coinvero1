import express from "express";
import Trade from "../models/Trade.js";
import Settings from "../models/Settings.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/* ================= PLACE TRADE ================= */

router.post("/", authMiddleware, async (req, res) => {
  try {
    let { pair, direction, amount, deliveryTime } = req.body;

    // 🔥 FORCE NUMBER (THIS IS THE FIX)
    deliveryTime = Number(deliveryTime);
    amount = Number(amount);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ ALWAYS TRADE WITH USDT
    if (!user.balance.USDT || amount > user.balance.USDT) {
      return res.status(400).json({ message: "Insufficient USDT balance" });
    }

    // deduct USDT immediately
    user.balance.USDT -= amount;
    await user.save();

    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ tradingOpen: true });

    // ✅ PROFIT BASED ON DURATION
    let percentage;

    switch (deliveryTime) {
      case 30:
        percentage = 12;
        break;
      case 60:
        percentage = 15;
        break;
      case 120:
        percentage = 20;
        break;
      case 300:
        percentage = 25;
        break;
      default:
        percentage = 15;
    }

    const entryPrice = Number(
      (60000 + Math.random() * 2000).toFixed(2)
    );

    const trade = await Trade.create({
      userId: user._id,
      coin: "USDT",
      pair,
      direction,
      amount,
      entryPrice,
      deliveryTime,
      percentage, // ✅ correct value now
      status: "pending"
    });

    /* ================= AUTO CLOSE ================= */

    setTimeout(async () => {
      try {
        const t = await Trade.findById(trade._id);
        if (!t || t.status === "closed") return;

        const u = await User.findById(t.userId);
        if (!u) return;

        let profitLoss = 0;

        // 🔥 USE t.percentage (VERY IMPORTANT)
        if (!settings.tradingOpen) {
          profitLoss = -(t.amount * t.percentage) / 100;
        } else {
          profitLoss = (t.amount * t.percentage) / 100;
        }

        t.profitLoss = profitLoss;
        t.status = "closed";
        t.closedAt = new Date();

        await t.save();

        // return USDT balance
        u.balance.USDT += t.amount + profitLoss;
        await u.save();

      } catch (err) {
        console.error("Auto close error:", err);
      }
    }, deliveryTime * 1000);

    res.json({
      message: "Trade placed successfully",
      trade,
      balance: user.balance
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Trade execution failed" });
  }
});

/* ================= USER TRADES ================= */

router.get("/", authMiddleware, async (req, res) => {
  try {
    const trades = await Trade.find({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    res.json(trades);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch trades" });
  }
});

export default router;