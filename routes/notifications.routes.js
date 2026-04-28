import express from "express";
import auth from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// ======================
// GET USER NOTIFICATIONS
// ======================
// ======================
// GET USER NOTIFICATIONS (user + global)
// ======================
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { userId: req.user._id }, // personal notifications
        { userId: null },         // global notifications
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json(notifications);
  } catch (err) {
    console.error("GET NOTIFICATIONS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


// ======================
// CREATE NOTIFICATION (Admin or system)
// ======================
router.post("/", async (req, res) => {
  try {
    const { userId, message, type } = req.body;
    if (!message) return res.status(400).json({ message: "Message required" });

    const notification = await Notification.create({
      userId: userId || null, // null = global notification
      message,
      type: type || "info",
      read: false,
    });

    return res.status(201).json(notification);
  } catch (err) {
    console.error("CREATE NOTIFICATION ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ======================
// MARK AS READ
// ======================
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    return res.json(notification);
  } catch (err) {
    console.error("MARK READ ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;