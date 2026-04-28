
import express from "express";
import Withdraw from "../models/Withdraw.js";
import auth from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();


// =======================
// CREATE WITHDRAW REQUEST
// =======================
router.post("/", auth, async (req, res) => {
  try {
    const { coin, network, address, amount } = req.body;

    const user = await User.findById(req.user.id);

    if (!user || user.balance[coin] < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const withdraw = await Withdraw.create({
      userId: user._id,
      coin,
      network,
      address,
      amount
    });

    res.json(withdraw);
  } catch (err) {
    res.status(500).json(err.message);
  }
});


// =======================
// USER WITHDRAW HISTORY
// =======================
router.get("/my", auth, async (req, res) => {
  const history = await Withdraw.find({
    userId: req.user.id
  }).sort({ createdAt: -1 });

  res.json(history);
});


// =======================
// ADMIN: GET ALL
// =======================
router.get("/all", async (req, res) => {
  const history = await Withdraw.find()
    .populate("userId", "email")
    .sort({ createdAt: -1 });

  res.json(history);
});


// =======================
// ADMIN APPROVE / REJECT
// =======================
router.put("/:id", async (req, res) => {
  const { status, txid } = req.body;

  const withdraw = await Withdraw.findById(req.params.id);

  if (!withdraw) return res.sendStatus(404);

  withdraw.status = status;
  withdraw.txid = txid || "";

  await withdraw.save();

  res.json(withdraw);
});

export default router;