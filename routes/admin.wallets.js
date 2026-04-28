
import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import AdminWallet from "../models/AdminWallet.js";

const router = express.Router();

router.get("/", adminAuth, async (req, res) => {
  res.json(await AdminWallet.find());
});

router.post("/", adminAuth, async (req, res) => {
  const wallet = await AdminWallet.create(req.body);
  res.json(wallet);
});

export default router;