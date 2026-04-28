import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";

// Controller: change admin password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 1️⃣ Check if both fields exist
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2️⃣ Get admin from middleware
    const admin = req.admin;

    // 3️⃣ Check if old password is correct
    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    // 4️⃣ Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 5️⃣ Update password in DB
    admin.password = hashedPassword;
    await admin.save();

    res.json({ message: "Password changed successfully ✅" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};