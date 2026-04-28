import express from "express";
import Admin from "../models/Admin.js";

const router = express.Router();

// ⚠️ USE ONLY ONCE THEN DELETE
router.get("/create-admin", async (req, res) => {
  try {
    const admin = await Admin.create({
      email: "admin@gmail.com",
      password: "admin123",
    });

    res.json({
      success: true,
      admin,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

export default router;