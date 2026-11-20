import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  email: String,
  password: String,

  // Used to invalidate old login sessions
  tokenVersion: {
    type: Number,
    default: 0
  }
});

export default mongoose.model("Admin", adminSchema);

