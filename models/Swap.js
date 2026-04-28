
import mongoose from "mongoose";

const swapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fromCoin: String,
  toCoin: String,
  amountFrom: Number,
  amountTo: Number,
  fee: Number,
}, { timestamps: true });

export default mongoose.model("Swap", swapSchema);
