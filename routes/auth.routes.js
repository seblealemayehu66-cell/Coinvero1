
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import Notification from "../models/Notification.js";
import getNextUid from "../middleware/getNextUid.js";
import auth from "../middleware/auth.js";
import crypto from "crypto"; // for referral code generation

const router = express.Router();

// ======================
// REGISTER
// ======================
router.post("/register", async (req, res) => {
  try {
    const { firstName,lastName,email, password } = req.body;

    // ✅ validation
    if (!firstName || !lastName ||!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // ✅ check existing user
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // ✅ hash password
    const hashed = await bcrypt.hash(password, 10);

    // ✅ generate UID
    const uid = await getNextUid();

    // ✅ generate unique referral code (8 chars)
    const referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    // ✅ create user
    const user = await User.create({
      uid,
      firstName,
      lastName,
      email,
      password: hashed,
      referralCode, // NEW
      referredBy: null, // optional, will be set if someone used a code
      balance: {
        BTC: 0,
        ETH: 0,
        USDT: 0,
        SOL: 0,
        BNB: 0,
        ADA: 0,
        XRP: 0,
        DOT: 0,
        DOGE: 0,
        LTC: 0,
        AVAX: 0,
        SHIB: 0,
      },
          
    });

    // ✅ default wallets
    const coins = [
      { coin: "Bitcoin", symbol: "BTC" },
      { coin: "Ethereum", symbol: "ETH" },
      { coin: "Solana", symbol: "SOL" },
      { coin: "Dogecoin", symbol: "DOGE" },
      { coin: "BNB", symbol: "BNB" },
    ];

    await Promise.all(
      coins.map((c) =>
        Wallet.create({
          userId: user._id,
          coin: c.coin,
          symbol: c.symbol,
          balance: 0,
        })
      )
    );

    // ✅ admin notification
    

    // ✅ VERY IMPORTANT
    return res.status(201).json({
      success: true,
      message: "Registration successful",
      uid: user.uid,
      referralCode: user.referralCode, // send referral code to frontend
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);

    return res.status(500).json({
      message: "Server error. Please try again.",
    });
  }
});

// ======================
// LOGIN
// ======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // ✅ password check
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({
        message: "Wrong password",
      });
    }

    // ✅ create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        uid: user.uid,
        firstName: user.firstName,
        lastName: user.firstName,
        email: user.email,
        balance: user.balance,
        referralCode: user.referralCode,   
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
});

// ======================
// GET CURRENT USER
// ======================
router.get("/me", auth, async (req, res) => {
  try {
    const { uid, firstName, lastName,email, balance, referralCode } = req.user;

    return res.json({
      uid,
      firstName,
      lastName,
      email,
      balance,
      referralCode,
    });

  } catch (err) {
    console.error("ME ERROR:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
});
// ======================
// UPDATE PROFILE
// ======================
router.put("/update", auth, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email is being updated and already exists
    const exist = await User.findOne({ email, _id: { $ne: req.user._id } });
    if (exist) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, email },
      { new: true }
    );

    return res.json({
      uid: updatedUser.uid,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      balance: updatedUser.balance,
      referralCode: updatedUser.referralCode,
         
    });

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;