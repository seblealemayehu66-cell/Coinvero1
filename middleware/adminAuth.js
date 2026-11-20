import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export default async function adminAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No token"
    });
  }

  try {
    const token = header.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        message: "Invalid admin"
      });
    }

    // Check whether this token belongs to the latest session version
    if (
      decoded.tokenVersion === undefined ||
      decoded.tokenVersion !== (admin.tokenVersion ?? 0)
    ) {
      return res.status(401).json({
        message: "Session expired. Please log in again."
      });
    }

    req.admin = admin;

    next();

  } catch (err) {
    return res.status(401).json({
      message: "Invalid token"
    });
  }
}

