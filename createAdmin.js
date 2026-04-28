
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";

mongoose.connect(process.env.COIN_MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

async function createAdmin() {
  const email = "admin@gmail.com"; // keep same admin email
  const password = "admin123";     // new password you want to reset

  const hash = await bcrypt.hash(password, 10);

  const existing = await Admin.findOne({ email });
  if (existing) {
    existing.password = hash;   // RESET password
    await existing.save();
    console.log("⚠️ Admin password reset");
  } else {
    await Admin.create({ email, password: hash });
    console.log("✅ Admin created");
  }

  console.log("Email:", email);
  console.log("Password:", password);

  process.exit();
}

createAdmin();
