import mongoose from "mongoose";

const adminWalletSchema = new mongoose.Schema({
  coin: String,
  symbol: String,
  network: String,
  address: String,
  qrCode: String
});

export default mongoose.model("AdminWallet", adminWalletSchema);