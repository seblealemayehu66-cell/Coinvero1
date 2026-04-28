import express from "express";
const router = express.Router();

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  // 1️⃣ Validate fields
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Passwords do not match" });
  }

  try {
    // 2️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    // 3️⃣ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4️⃣ Create user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // 5️⃣ Create JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6️⃣ Return user info + token
    res.json({
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;