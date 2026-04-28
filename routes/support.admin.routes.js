
import express from "express";
import SupportTicket from "../models/SupportTicket.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

const router = express.Router();

/**
 * GET ALL TICKETS
 */
router.get("/tickets", verifyAdmin, async (req, res) => {
  const tickets = await SupportTicket.find()
    .populate("user", "username email uid")
    .sort({ createdAt: -1 });

  res.json(tickets);
});
// Get a single ticket
router.get("/tickets/:id", verifyAdmin, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate("user", "username email");
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ADMIN REPLY
 */
router.post("/tickets/:id/reply", verifyAdmin, async (req, res) => {
  const { message } = req.body;

  const ticket = await SupportTicket.findById(req.params.id);

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  ticket.messages.push({
    sender: "admin",
    message,
  });

  ticket.status = "Open";

  await ticket.save();

  res.json(ticket.messages.at(-1));
});

/**
 * CLOSE TICKET
 */
router.post("/tickets/:id/close", verifyAdmin, async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id);

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  ticket.status = "Closed";
  await ticket.save();

  res.json(ticket);
});

export default router;