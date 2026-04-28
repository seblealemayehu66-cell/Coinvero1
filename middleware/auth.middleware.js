

import jwt from "jsonwebtoken";
import User from "../models/User.js";

// This middleware protects routes and fetches the logged-in user
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // find user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    // attach user to request
    req.user = user;

    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    res.status(401).json({ message: "Session expired" });
  }
};

export default authMiddleware;
