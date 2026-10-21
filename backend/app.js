import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";
import authRoutes from "./route/authRoute.js";
import customerRoute from "./route/customerRoute.js";
import bookingRoute from "./route/bookingRoute.js";
import "dotenv/config";
import { setServers } from "dns";
dotenv.config({ path: "../.env" });

const app = express();
setServers(["8.8.8.8", "1.1.1.1"]);
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api/customer", customerRoute);
app.use("/api/bookings", bookingRoute);

app.use("/auth", authRoutes);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Trimly API is live and running!",
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});