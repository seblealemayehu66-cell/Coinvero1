import mongoose from "mongoose";

const withdrawSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    coin: String,
    network: String,
    address: String,

    amount: Number,

    status: {
      type: String,
      default: "pending", // pending | approved | rejected
    },

    txid: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export default mongoose.model("Withdraw", withdrawSchema);