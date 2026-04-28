
import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/users", adminAuth, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

export default router;