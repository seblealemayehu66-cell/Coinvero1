
import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";

// Change admin password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 1. Validate fields
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // 2. Get authenticated admin
    const admin = req.admin;

    if (!admin) {
      return res.status(401).json({
        message: "Admin not authenticated"
      });
    }

    // 3. Verify old password
    const isMatch = await bcrypt.compare(
      oldPassword,
      admin.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect"
      });
    }

    // 4. Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters"
      });
    }

    // 5. Hash new password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      newPassword,
      salt
    );

    // 6. Update password
    admin.password = hashedPassword;

    // 7. Invalidate all previous login tokens
    admin.tokenVersion = (admin.tokenVersion ?? 0) + 1;

    await admin.save();

    return res.json({
      message: "Password changed successfully. Please log in again on all devices."
    });

  } catch (err) {
    console.error("Change password error:", err);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};
