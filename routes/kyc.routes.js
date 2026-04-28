import express from "express";
import Kyc from "../models/Kyc.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/* =========================
   Submit KYC
========================= */
router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const { fullName, dob, country, documentType, documentImage } = req.body;

    if (!documentImage) {
      return res.status(400).json({ message: "Document image is required" });
    }

    const existing = await Kyc.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: "KYC already submitted" });
    }

    const kyc = await Kyc.create({
      userId: req.user.id,
      fullName,
      dob,
      country,
      documentType,
      documentImage,
      status: "pending",
    });

    res.status(201).json({
      message: "KYC submitted successfully",
      kyc,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   Get KYC Status
========================= */
router.get("/status", authMiddleware, async (req, res) => {
  try {
    const kyc = await Kyc.findOne({ userId: req.user.id });

    if (!kyc) {
      return res.json({ status: "not_submitted" });
    }

    res.json(kyc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;