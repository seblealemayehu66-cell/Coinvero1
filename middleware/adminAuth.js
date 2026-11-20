
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const ADMIN_SESSION_DURATION = 10 * 60; // 10 minutes in seconds

export default async function adminAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Reject tokens older than 10 minutes,
    // including previously issued 7-day tokens.
    const now = Math.floor(Date.now() / 1000);

    if (
      !decoded.iat ||
      now - decoded.iat >= ADMIN_SESSION_DURATION
    ) {
      return res.status(401).json({
        message: "Admin session expired. Please login again.",
      });
    }

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        message: "Invalid admin",
      });
    }

    req.admin = admin;
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}
