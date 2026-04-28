import express from "express";
import User from "../models/User.js";
import  adminAuth  from "../middleware/adminAuth.js"; // Protect admin routes
import Trade from "../models/Trade.js";
import Settings from "../models/Settings.js";
import authMiddleware from "../middleware/auth.js";
import { changePassword } from "../controllers/admin.controller.js";



// Change password route



const router = express.Router();

router.put("/change-password", adminAuth, changePassword);

// GET all users (protected)
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.json(users);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Add balance to user (protected)
router.post("/users/add-balance", adminAuth, async (req, res) => {
  const { userId, symbol, amount } = req.body;
  if (!userId || !symbol || !amount) return res.status(400).json({ message: "All fields are required" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.balance = user.balance || {};
    user.balance[symbol] = (user.balance[symbol] || 0) + Number(amount);

    await user.save();
    res.json({ message: "Balance updated", balance: user.balance });
  } catch (err) {
    console.error("Add balance error:", err);
    res.status(500).json({ message: "Failed to add balance" });
  }
});
router.post("/toggle-trade", authMiddleware, async (req, res) => {
  const settings = (await Settings.findOne()) || (await Settings.create({}));
  settings.tradingOpen = !settings.tradingOpen;
  await settings.save();
  res.json({ tradingOpen: settings.tradingOpen });
});

// Get all trades
router.get("/trades", authMiddleware, async (req, res) => {
  const trades = await Trade.find().populate("userId").sort({ createdAt: -1 });
  res.json(trades);
});

// Close a trade manually
router.post("/close-trade/:id", authMiddleware, async (req, res) => {
  const trade = await Trade.findById(req.params.id);
  if (!trade) return res.status(404).json({ message: "Trade not found" });
  if (trade.status === "closed") return res.status(400).json({ message: "Trade already closed" });

  // Always close as loss if admin manually closes
  const user = await Trade.model("User").findById(trade.userId);
  const profitLoss = -trade.amount * (trade.percentage / 100);

  trade.status = "closed";
  trade.profitLoss = profitLoss;
  trade.closedAt = new Date();
  await trade.save();

  user.balance[trade.coin] += trade.amount + profitLoss - trade.amount * (trade.fee / 100);
  await user.save();

  res.json({ trade, userBalance: user.balance });
});
router.get("/users", authMiddleware, async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) return res.status(400).json([]);

    const users = await User.find({
      $or: [
        { email: { $regex: query, $options: "i" } },
        { firstName: { $regex: query, $options: "i" } },
      ],
    }).limit(5); // limit results

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;