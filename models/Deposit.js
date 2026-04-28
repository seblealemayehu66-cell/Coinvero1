import mongoose from "mongoose";

const depositSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    network: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    proofImage: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);
export default mongoose.model("Deposit", depositSchema);