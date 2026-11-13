import "../config/env.js"; 
import mongoose from "mongoose";
import { setServers } from "dns";
import Status from "../model/statusModel.js";

setServers(["8.8.8.8", "1.1.1.1"]);

const statuses = [
  // BOOKING Statuses
  {
    name: "PENDING",
    type: "BOOKING",
    description: "Waiting for barber to accept",
  },
  {
    name: "ACCEPTED",
    type: "BOOKING",
    description: "Barber accepted, waiting for payment",
  },
  {
    name: "CONFIRMED",
    type: "BOOKING",
    description: "Payment done, booking locked",
  },
  {
    name: "IN_PROGRESS",
    type: "BOOKING",
    description: "Service is currently happening",
  },
  { name: "COMPLETED", type: "BOOKING", description: "Service finished" },
  {
    name: "CANCELLED",
    type: "BOOKING",
    description: "Cancelled by customer or barber",
  },
  { name: "REJECTED", type: "BOOKING", description: "Rejected by barber" },
  { name: "EXPIRED", type: "BOOKING", description: "Timer ran out" },

  // PAYMENT Statuses
  { name: "PENDING", type: "PAYMENT", description: "Payment initiated" },
  { name: "SUCCESS", type: "PAYMENT", description: "Payment successful" },
  { name: "FAILED", type: "PAYMENT", description: "Payment failed" },

  // REFUND Statuses
  { name: "PENDING", type: "REFUND", description: "Refund initiated" },
  { name: "PROCESSED", type: "REFUND", description: "Refund completed" },
];

const seedStatuses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    for (const status of statuses) {
      await Status.findOneAndUpdate(
        { name: status.name, type: status.type },
        { $set: status },
        { upsert: true, returnDocument: "after" },
      );
    }

    console.log("🎉 All statuses seeded successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

seedStatuses();