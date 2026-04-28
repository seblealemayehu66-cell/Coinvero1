// models/Kyc.js
import mongoose from "mongoose";

const kycSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fullName: String,
  dob: String,
  country: String,
  documentType: String, // Passport / ID / Driver License
  documentImage: String, // URL or filename
  status: { type: String, default: "pending" }, // pending / approved / rejected
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Kyc", kycSchema);