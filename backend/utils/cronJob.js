import cron from "node-cron";
import Booking from "../model/bookingModel.js";
import Status from "../model/statusModel.js";
import Refund from "../model/refundModel.js";
import Payment from "../model/paymentModel.js";

export const startCronJobs = () => {
  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // Pre-fetch all required statuses to save DB queries
      const statusDocs = await Status.find({
        $or: [
          {
            type: "BOOKING",
            name: {
              $in: [
                "EXPIRED",
                "PENDING_BARBER",
                "PENDING_CUSTOMER",
                "CANCELLED",
                "PENDING_BARBER_APPROVAL",
                "PENDING_CUSTOMER_RESCHEDULE",
              ],
            },
          },
          { type: "REFUND", name: "PENDING" },
        ],
      });

      const getStatusId = (name, type = "BOOKING") => {
        const status = statusDocs.find(
          (s) => s.name === name && s.type === type,
        );
        if (!status)
          throw new Error(`Status ${name} (${type}) not found in DB`);
        return status._id;
      };

      // 1. Expire PENDING_BARBER and PENDING_CUSTOMER (Timeout)
      await Booking.updateMany(
        {
          statusId: {
            $in: [
              getStatusId("PENDING_BARBER"),
              getStatusId("PENDING_CUSTOMER"),
            ],
          },
          holdExpiresAt: { $lt: now },
          deletedAt: null,
        },
        { $set: { statusId: getStatusId("EXPIRED"), holdExpiresAt: null } },
      );

      // 2. Expire PENDING_BARBER_APPROVAL (Off-peak, auto reject if < 1 hr before booking)
      const offPeakBookings = await Booking.find({
        statusId: getStatusId("PENDING_BARBER_APPROVAL"),
        deletedAt: null,
      });

      for (const b of offPeakBookings) {
        const bookingDateTime = new Date(
          `${b.bookingDate.toISOString().split("T")[0]}T${b.startTime}:00.000+05:00`,
        );
        const oneHourBefore = new Date(
          bookingDateTime.getTime() - 60 * 60 * 1000,
        );

        if (now > oneHourBefore) {
          await Booking.findByIdAndUpdate(b._id, {
            statusId: getStatusId("CANCELLED"),
          });

          const payment = await Payment.findOne({ bookingId: b._id });
          if (payment) {
            await Refund.create({
              bookingId: b._id,
              paymentId: payment._id,
              amount: b.depositAmount,
              reason: "Barber failed to respond 1 hour before booking",
              statusId: getStatusId("PENDING", "REFUND"),
            });
          }
        }
      }

      // 3. Expire PENDING_CUSTOMER_RESCHEDULE (Customer didn't respond in time)
      const expiredReschedules = await Booking.find({
        statusId: getStatusId("PENDING_CUSTOMER_RESCHEDULE"),
        holdExpiresAt: { $lt: now },
        deletedAt: null,
      });

      for (const b of expiredReschedules) {
        await Booking.findByIdAndUpdate(b._id, {
          statusId: getStatusId("CANCELLED"),
          holdExpiresAt: null,
          rescheduleProposedStartTime: null,
          rescheduleProposedEndTime: null,
        });

        // Off-peak bookings were already paid, so they need a refund
        if (b.isOffPeakBooking) {
          const payment = await Payment.findOne({ bookingId: b._id });
          if (payment) {
            await Refund.create({
              bookingId: b._id,
              paymentId: payment._id,
              amount: b.depositAmount,
              reason: "Customer did not respond to reschedule request",
              statusId: getStatusId("PENDING", "REFUND"),
            });
          }
        }
      }
    } catch (error) {
      console.error("Cron Job Error:", error);
    }
  });
};