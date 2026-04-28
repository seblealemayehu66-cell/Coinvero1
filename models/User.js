
// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
   uid: {
    type: Number,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  balance: {
    BTC: { type: Number, default: 0 },
    ETH: { type: Number, default: 0 },
    USDT: { type: Number, default: 0 },
      SOL: { type: Number, default: 0 },
      BNB: { type: Number, default: 0 },
      ADA: { type: Number, default: 0 },
      XRP: { type: Number, default: 0 },
      DOT: { type: Number, default: 0 },
      DOGE: { type: Number, default: 0 },
      LTC: { type: Number, default: 0 },
      AVAX: { type: Number, default: 0 },
      SHIB: { type: Number, default: 0 },
     XAU: {type: Number, default: 0},
     XAG: {type: Number, default: 0}
    
  },

  withdrawPassword: String,
  kycStatus: { type: String, default: "pending" },

  createdAt: { type: Date, default: Date.now },
 referralCode: { type: String, unique: true },
  referredBy: { type: String, default: null }, // store the referrer code
  referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // users this person referred
  rewards: [{ type: Date, reward: Number }],
}); { timestamps: true };

export default mongoose.model("User", userSchema);
