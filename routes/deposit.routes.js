import express from "express";
import Deposit from "../models/Deposit.js";
import upload from "../middleware/upload.js";
import auth from "../middleware/auth.js";

const router = express.Router();


// ✅ CREATE DEPOSIT
router.post(
  "/",
  auth,
  upload.single("proofImage"),
  async (req, res) => {
    try {
      const { symbol, network, address, amount } = req.body;

      const deposit = new Deposit({
        userId: req.user.id,
        symbol,
        network,
        address,
        amount,
        proofImage: req.file ? `/uploads/${req.file.filename}` : "",
      });

      await deposit.save();

      res.status(201).json({
        message: "Deposit submitted successfully",
        deposit,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Error creating deposit",
      });
    }
  }
);


// ✅ GET USER DEPOSITS
router.get("/my", auth, async (req, res) => {
  try {
    const deposits = await Deposit.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(deposits);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching deposits",
    });
  }
});


export default router;