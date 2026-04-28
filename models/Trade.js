
import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  coin: String,
  pair: String,
  direction: { type: String, enum: ["up", "down"] },
  amount: Number,
  price: Number,
  deliveryTime: Number,
  fee: { type: Number, default: 0.3 },
  percentage: { type: Number, default: 15 },
  status: { type: String, enum: ["pending", "closed"], default: "pending" },
  profitLoss: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  closedAt: { type: Date },
});

export default mongoose.model("Trade", tradeSchema);
