import express from "express";
import Deposit from "../models/Deposit.js";
import User from "../models/User.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/* ================= GET ALL DEPOSITS ================= */

router.get("/", adminAuth, async (req, res) => {
  try {
    const deposits = await Deposit.find()
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json(deposits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch deposits" });
  }
});

/* ================= APPROVE / REJECT ================= */

router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    const deposit = await Deposit.findById(req.params.id);
    if (!deposit)
      return res.status(404).json({ message: "Deposit not found" });

    if (deposit.status !== "pending")
      return res.status(400).json({ message: "Already processed" });

    deposit.status = status;
    await deposit.save();

    // ✅ IF APPROVED → ADD BALANCE TO USER
    if (status === "approved") {
      const user = await User.findById(deposit.userId);

      if (!user.balance[deposit.symbol]) {
        user.balance[deposit.symbol] = 0;
      }

      user.balance[deposit.symbol] += deposit.amount;

      await user.save();
    }

    res.json({ message: "Deposit updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

export default router;