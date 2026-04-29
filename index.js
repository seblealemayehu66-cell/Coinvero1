
// index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import adminSetupRoutes from "./routes/admin.setup.routes.js";

import adminDepositRoutes from "./routes/adminDeposit.routes.js";



import swapRoutes from "./routes/swap.routes.js";



import notificationsRoutes from "./routes/notifications.routes.js";

import walletRoutes from "./routes/wallet.routes.js";
import adminWalletRoutes from "./routes/admin.wallet.routes.js";
import publicAdminWalletRoutes from "./routes/public.adminwallet.routes.js";
import rewardsRoutes from "./routes/rewards.js";
import settingsRoutes from "./routes/settings.routes.js";
import tradeRoutes from "./routes/trade.routes.js";






import withdrawRoutes from "./routes/withdraw.routes.js";
import supportRoutes from "./routes/support.routes.js";
import kycRoutes from "./routes/kyc.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import depositRoutes from "./routes/deposit.routes.js";


import adminKycRoutes from "./routes/adminKyc.routes.js";










// Public routes
import adminWithdrawRoutes from "./routes/admin.withdraw.routes.js";

// only admin authenticated

import adminSupportRoutes from "./routes/support.admin.routes.js";
import coinsRoutes from "./routes/coins.routes.js";






















// ===== LOAD ROUTES =====
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import adminAuthRoutes from "./routes/admin.auth.routes.js";





// optional route to fetch by UID


// ===== LOAD ENVIRONMENT VARIABLES =====
dotenv.config();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors({ origin: "*" })); // Allow requests from any origin
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// ===== ROUTES =====
app.use("/api/auth", authRoutes);    // register, login, current user
app.use("/api/admin/", adminRoutes);  // admin routes (if you have any)
app.use("/api/admin/wallets", adminRoutes);
app.use("/api", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/setup", adminSetupRoutes);

app.use("/api/account", walletRoutes);
app.use("/api/admin", adminWalletRoutes);
app.use("/api/public", publicAdminWalletRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/trade", tradeRoutes);

app.use("/api/withdraw", withdrawRoutes);
app.use("/api/admin/withdraws", adminWithdrawRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/admin/support", adminSupportRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/admin/kyc", adminKycRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin/deposits", adminDepositRoutes);

app.use("/api/coins", coinsRoutes);
app.use("/api/deposits", depositRoutes);
app.use("/api/notifications", notificationsRoutes);



app.use("/api/swap", swapRoutes);





// ===== HEALTH CHECK =====
app.get("/", (req, res) => res.send("Backend is running 🚀"));

// ===== 404 HANDLER =====
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// ===== DATABASE CONNECTION =====




// ===== DATABASE CONNECTION =====


const DB = process.env.COIN_MONGO_URL; // Railway MongoDB

if (!DB) {
  console.error("❌ MONGO_URL is not defined in Railway variables");
  process.exit(1);
}

mongoose
  .connect(DB)
  .then(() => console.log("MongoDB Connected ✅ (Railway)"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// ===== START SERVER =====
const PORT = process.env.PORT || 8080;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} 🚀`)
);
