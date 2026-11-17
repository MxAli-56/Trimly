
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "node:dns";
import Status from "../model/statusModel.js";

dotenv.config({ path: "../.env" });

// Fix MongoDB Atlas SRV DNS resolution
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const bookingStatuses = [
  "PENDING",
  "ACCEPTED",
  "CONFIRMED",
  "REJECTED",
  "EXPIRED",
];

const seedBookingStatuses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    for (const name of bookingStatuses) {
      await Status.updateOne(
        { name, type: "BOOKING" },
        {
          $set: { deletedAt: null },
          $setOnInsert: {
            description: `${name} booking status`,
          },
        },
        { upsert: true }
      );

      console.log(`${name} status ready`);
    }

    console.log("All booking statuses ready!");
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

seedBookingStatuses();
