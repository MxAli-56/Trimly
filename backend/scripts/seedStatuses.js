import "../config/env.js";
import mongoose from "mongoose";
import { setServers } from "dns";
import Status from "../model/statusModel.js";

setServers(["8.8.8.8", "1.1.1.1"]);

const statuses = [
  // BOOKING Statuses (Your exact flow)
  {
    name: "PENDING_BARBER",
    type: "BOOKING",
    description: "Waiting for barber to accept (2 mins)",
  },
  {
    name: "PENDING_CUSTOMER",
    type: "BOOKING",
    description: "Barber accepted, waiting for payment (3 mins)",
  },
  {
    name: "PENDING_CUSTOMER_RESCHEDULE",
    type: "BOOKING",
    description: "Barber proposed a new time, waiting for customer response",
  },
  {
    name: "PENDING_BARBER_APPROVAL",
    type: "BOOKING",
    description: "Off-peak booking paid, waiting for barber final approval",
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
  {
    name: "EXPIRED",
    type: "BOOKING",
    description: "Timer ran out or auto-cancelled",
  },

  // PAYMENT Statuses
  { name: "PENDING", type: "PAYMENT", description: "Payment initiated" },
  { name: "SUCCESS", type: "PAYMENT", description: "Payment successful" },
  { name: "FAILED", type: "PAYMENT", description: "Payment failed" },

  // REFUND Statuses
  { name: "PENDING", type: "REFUND", description: "Refund initiated" },
  { name: "PROCESSED", type: "REFUND", description: "Refund completed" },

  //Non-working hours booking approval
  {
    name: "PENDING_BARBER_APPROVAL",
    type: "BOOKING",
    description: "Off-peak booking paid, waiting for barber to accept",
  },

  {
    name: "NO_SHOW",
    type: "BOOKING",
    description: "Customer did not arrive for the appointment",
  },

  // SCHEDULE_DAY Statuses (Individual Days)
  {
    name: "PENDING",
    type: "SCHEDULE_DAY",
    description: "Waiting for owner approval",
  },
  {
    name: "APPROVED",
    type: "SCHEDULE_DAY",
    description: "Owner approved this day",
  },
  {
    name: "REJECTED",
    type: "SCHEDULE_DAY",
    description: "Owner rejected this day",
  },
  {
    name: "APPLIED",
    type: "SCHEDULE_DAY",
    description: "Change applied to schedule",
  },

  // SCHEDULE_REQUEST Statuses (Overall Request)
  {
    name: "PENDING_OWNER_APPROVAL",
    type: "SCHEDULE_REQUEST",
    description: "Waiting for owner to review",
  },
  {
    name: "PARTIALLY_APPROVED",
    type: "SCHEDULE_REQUEST",
    description: "Some days approved, some rejected",
  },
  {
    name: "FULLY_APPROVED",
    type: "SCHEDULE_REQUEST",
    description: "All days approved",
  },
  {
    name: "REJECTED",
    type: "SCHEDULE_REQUEST",
    description: "All days rejected",
  },
  {
    name: "EXPIRED",
    type: "SCHEDULE_REQUEST",
    description: "7 days passed without owner action",
  },
  {
    name: "APPLIED",
    type: "SCHEDULE_REQUEST",
    description: "Changes applied to schedule",
  },
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