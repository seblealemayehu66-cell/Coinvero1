
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select(
      "_id uid balance email"
    );

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    // attach user to request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

export default auth;
