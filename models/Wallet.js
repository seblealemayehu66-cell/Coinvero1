
import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    coin: String,
    symbol: String,
    network: String,
    address: String,
    qrCode: String,

    balance: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Wallet", walletSchema);
