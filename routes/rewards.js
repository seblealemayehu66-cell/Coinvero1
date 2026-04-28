

import express from "express";
import User from "../models/User.js";
import auth  from "../middleware/auth.js";

const router = express.Router();

// Get user referral info
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("referrals", "username email uid");
    res.json({
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      referrals: user.referrals,
      balance: user.balance,
      rewards: user.rewards,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Apply referral code on signup
router.post("/apply", auth, async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: "Referral code required" });

  try {
    const referrer = await User.findOne({ referralCode: code });
    if (!referrer) return res.status(404).json({ message: "Invalid referral code" });

    const user = await User.findById(req.user.id);
    if (user.referredBy) return res.status(400).json({ message: "Referral already applied" });

    // Apply referral
    user.referredBy = code;
    referrer.referrals.push(user._id);

    // Give rewards
    const bonus = 10; // USD or points
    user.balance += bonus;
    referrer.balance += bonus;

    user.rewards.push({ date: new Date(), reward: bonus });
    referrer.rewards.push({ date: new Date(), reward: bonus });

    await user.save();
    await referrer.save();

    res.json({ message: "Referral applied successfully", bonus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
