
import express from "express";
import Withdraw from "../models/Withdraw.js";
import User from "../models/User.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// ✅ Get all withdrawals
router.get("/", adminAuth, async (req, res) => {
  try {
    const withdraws = await Withdraw.find()
      .populate("userId", "email")
      .sort({ createdAt: -1 });
    res.json(withdraws);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Approve / Reject withdraw AND deduct balance
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { status, txid } = req.body;

    const withdraw = await Withdraw.findById(req.params.id);
    if (!withdraw) return res.status(404).json({ message: "Not found" });

    // Only deduct balance if status is changing to approved
    if (status === "approved" && withdraw.status !== "approved") {
      const user = await User.findById(withdraw.userId);

      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.balance[withdraw.coin] || user.balance[withdraw.coin] < withdraw.amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Deduct balance
      user.balance[withdraw.coin] -= withdraw.amount;
      await user.save();
    }

    withdraw.status = status;
    withdraw.txid = txid || withdraw.txid;

    await withdraw.save();

    res.json(withdraw);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;