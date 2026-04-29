import express from "express";
import SupportTicket from "../models/SupportTicket.js";
import verifyToken from "../middleware/verifyToken.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const uploadImage = (file) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "support" }, (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      })
      .end(file.buffer);
  });

/* ================= OPEN TICKET ================= */
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
          },
        ],
      });
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: "Error opening ticket" });
  }
});

/* ================= SEND MESSAGE ================= */
router.post(
  "/:id/message",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const ticket = await SupportTicket.findById(req.params.id);
      if (!ticket) return res.status(404).json({ message: "Not found" });

      let imageUrl = null;
      if (req.file) imageUrl = await uploadImage(req.file);

      const msg = {
        sender: "user",
        message: req.body.message || "",
        image: imageUrl,
      };

      ticket.messages.push(msg);
      await ticket.save();

      res.json(ticket.messages[ticket.messages.length - 1]);
    } catch (err) {
      res.status(500).json({ message: "Send failed" });
    }
  }
);

/* ================= EDIT MESSAGE ================= */
router.put("/:ticketId/message/:messageId", verifyToken, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: "Not found" });

    const msg = ticket.messages.id(req.params.messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    msg.message = req.body.message;
    msg.editedAt = new Date();

    await ticket.save();

    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: "Edit failed" });
  }
});

/* ================= DELETE MESSAGE (SOFT) ================= */
router.delete("/:ticketId/message/:messageId", verifyToken, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: "Not found" });

    const msg = ticket.messages.id(req.params.messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    msg.isDeleted = true;
    msg.message = "This message was deleted";
    msg.image = null;

    await ticket.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
