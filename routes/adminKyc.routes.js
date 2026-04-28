// routes/adminKyc.routes.js
import express from "express";
import Kyc from "../models/Kyc.js";
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// =====================
// Middleware to check Admin
// =====================
export const isAdmin = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided" });

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ message: "Admin not found" });

    req.admin = admin;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid token" });
  }
};

// =====================
// GET all pending KYC
// =====================
router.get("/pending", isAdmin, async (req, res) => {
  try {
    const kycs = await Kyc.find({ status: "pending" }).populate(
      "userId",
      "username email"
    );
    res.json(kycs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================
// APPROVE or REJECT KYC
// =====================
router.put("/:id", isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const kyc = await Kyc.findById(req.params.id);
    if (!kyc) return res.status(404).json({ message: "KYC not found" });

    kyc.status = status;
    await kyc.save();

    res.json({ message: `KYC ${status}`, kyc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;