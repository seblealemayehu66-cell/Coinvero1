import express from "express";
import SupportTicket from "../models/SupportTicket.js";
import verifyToken from "../middleware/verifyToken.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* ================= OPEN OR GET TICKET ================= */
router.post("/open/:department", verifyToken, async (req, res) => {
  try {
    const { department } = req.params;

    let ticket = await SupportTicket.findOne({
      user: req.user._id,
      department,
    });

    if (!ticket) {
      ticket = await SupportTicket.create({
        user: req.user._id,
        department,
        messages: [
          {
            sender: "admin",
            message: `Welcome to ${department} support 👋`,
            image: null,
            createdAt: new Date(),
          },
        ],
      });
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: "Error opening ticket" });
  }
});

/* ================= USER SEND MESSAGE ================= */
router.post(
  "/:id/message",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const ticket = await SupportTicket.findById(req.params.id);
      if (!ticket) return res.status(404).json({ message: "Ticket not found" });

      let imageUrl = null;

      if (req.file) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "support" }, (err, result) => {
              if (err) reject(err);
              else resolve(result);
            })
            .end(req.file.buffer);
        });

        imageUrl = result?.secure_url || null;
      }

      const newMsg = {
        sender: "user",
        message: req.body.message || "",
        image: imageUrl,
        createdAt: new Date(),

        // 🔥 NEW FIELDS
        editedAt: null,
        isDeleted: false,
      };

      ticket.messages.push(newMsg);
      ticket.updatedAt = new Date();

      await ticket.save();

      res.json(newMsg);
    } catch (err) {
      res.status(500).json({ message: "Send failed" });
    }
  }
);

/* ================= ADMIN - GET ALL TICKETS ================= */
router.get("/admin/all", verifyToken, async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate("user", "name email")
      .sort({ updatedAt: -1 });

    res.json(tickets || []);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
});

/* ================= ADMIN REPLY ================= */
router.post("/admin/:ticketId/reply", verifyToken, async (req, res) => {
  try {
    const { message, image } = req.body;

    const ticket = await SupportTicket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const adminMsg = {
      sender: "admin",
      message: message || "",
      image: image || null,
      createdAt: new Date(),

      // 🔥 NEW FIELDS
      editedAt: null,
      isDeleted: false,
    };

    ticket.messages.push(adminMsg);
    ticket.updatedAt = new Date();

    await ticket.save();

    res.json(adminMsg);
  } catch (err) {
    res.status(500).json({ message: "Reply failed" });
  }
});

/* =========================================================
   ✏️ EDIT MESSAGE (USER + ADMIN)
   ========================================================= */
router.put("/:ticketId/message/:messageId", verifyToken, async (req, res) => {
  try {
    const { message } = req.body;

    const ticket = await SupportTicket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const msg = ticket.messages.id(req.params.messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    // optional: prevent editing deleted messages
    if (msg.isDeleted) {
      return res.status(400).json({ message: "Message is deleted" });
    }

    msg.message = message;
    msg.editedAt = new Date();

    await ticket.save();

    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: "Edit failed" });
  }
});

/* =========================================================
   ❌ DELETE MESSAGE (SOFT DELETE - USER + ADMIN)
   ========================================================= */
router.delete("/:ticketId/message/:messageId", verifyToken, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const msg = ticket.messages.id(req.params.messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    // 🔥 SOFT DELETE (Telegram style)
    msg.isDeleted = true;
    msg.message = "This message was deleted";
    msg.image = null;
    msg.editedAt = new Date();

    await ticket.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
