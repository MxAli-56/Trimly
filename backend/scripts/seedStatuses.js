import "../config/env.js";
import mongoose from "mongoose";
import { setServers } from "dns";
import Status from "../model/statusModel.js";
import Booking from "../model/bookingModel.js";
import Payment from "../model/paymentModel.js";
import Refund from "../model/refundModel.js";
import ScheduleUpdateRequest from "../model/scheduleUpdateRequestModel.js";

setServers(["8.8.8.8", "1.1.1.1"]);

const statuses = [
  // BOOKING
  {
    name: "PENDING_BARBER",
    type: "BOOKING",
    description: "Waiting for barber to accept (2 min)",
  },
  {
    name: "PENDING_CUSTOMER",
    type: "BOOKING",
    description: "Barber accepted, waiting for customer payment (3 min)",
  },
  {
    name: "PENDING_CUSTOMER_RESCHEDULE",
    type: "BOOKING",
    description: "Barber proposed new time, waiting for customer response",
  },
  {
    name: "PENDING_BARBER_APPROVAL",
    type: "BOOKING",
    description: "Off-peak paid, waiting for barber final approval",
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
  { name: "NO_SHOW", type: "BOOKING", description: "Customer did not arrive" },

  // PAYMENT
  { name: "PENDING", type: "PAYMENT", description: "Payment initiated" },
  { name: "SUCCESS", type: "PAYMENT", description: "Payment successful" },
  { name: "FAILED", type: "PAYMENT", description: "Payment failed" },

  // REFUND
  { name: "PENDING", type: "REFUND", description: "Refund initiated" },
  { name: "PROCESSED", type: "REFUND", description: "Refund completed" },

  // SCHEDULE_DAY
  {
    name: "PENDING",
    type: "SCHEDULE_DAY",
    description: "Waiting for owner approval",
  },
  { name: "APPROVED", type: "SCHEDULE_DAY", description: "Owner approved" },
  { name: "REJECTED", type: "SCHEDULE_DAY", description: "Owner rejected" },
  { name: "APPLIED", type: "SCHEDULE_DAY", description: "Change applied" },

  // SCHEDULE_REQUEST
  {
    name: "PENDING_OWNER_APPROVAL",
    type: "SCHEDULE_REQUEST",
    description: "Waiting for owner review",
  },
  {
    name: "PARTIALLY_APPROVED",
    type: "SCHEDULE_REQUEST",
    description: "Some approved, some rejected",
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
  { name: "EXPIRED", type: "SCHEDULE_REQUEST", description: "7 days passed" },
  {
    name: "APPLIED",
    type: "SCHEDULE_REQUEST",
    description: "Applied to schedule",
  },
  { name: "WAITING", type: "QUEUE", description: "Waiting in line for slot" },
  { name: "PROMOTED", type: "QUEUE", description: "Slot offered, converted to booking" },
  { name: "EXPIRED", type: "QUEUE", description: "Queue entry expired" },
];

const seedStatuses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Clear old data that depends on statuses
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    await Refund.deleteMany({});
    await ScheduleUpdateRequest.deleteMany({});
    await Status.deleteMany({});
    console.log(
      "🧹 Cleared: bookings, payments, refunds, schedule requests, statuses",
    );

    for (const status of statuses) {
      await Status.create(status);
    }

    console.log(`🎉 ${statuses.length} statuses seeded successfully!`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

seedStatuses();