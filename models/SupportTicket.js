import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["user", "admin"], required: true },
  message: String,
  image: String,
  createdAt: { type: Date, default: Date.now },

  // ✅ NEW (Telegram style)
  editedAt: { type: Date, default: null },
  isDeleted: { type: Boolean, default: false },
});

const ticketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    department: {
      type: String,
      enum: ["it", "personal"],
    },

    status: { type: String, default: "Open" },
    messages: [messageSchema],
  },
  { timestamps: true }
);

export default mongoose.model("SupportTicket", ticketSchema);
