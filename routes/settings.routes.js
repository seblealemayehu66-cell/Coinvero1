
import express from "express";
import Settings from "../models/Settings.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json(settings);
});

router.put("/trading", adminAuth, async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});

  settings.tradingOpen = req.body.tradingOpen;
  await settings.save();

  res.json(settings);
});

export default router;