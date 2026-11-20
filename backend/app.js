
import "./config/env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";

import connectDB from "./config/db.js";
import { initializeSocket } from "./config/socket.js";

import authRoutes from "./route/authRoute.js";
import customerRoute from "./route/customerRoute.js";
import bookingRoute from "./route/bookingRoute.js";
import barberRoute from "./route/barberRoute.js";
import reviewRoutes from "./route/reviewRoute.js";
import ownerRoute from "./route/ownerRoute.js";

const app = express();
const httpServer = http.createServer(app);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/customer", customerRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/barber", barberRoute);
app.use("/api/owner", ownerRoute);
app.use("/api/reviews", reviewRoutes);

app.use("/auth", authRoutes);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Trimly API is live and running!",
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  initializeSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
