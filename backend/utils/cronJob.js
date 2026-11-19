import cron from "node-cron";
import Booking from "../model/bookingModel.js";
import Status from "../model/statusModel.js";
import Refund from "../model/refundModel.js";
import Payment from "../model/paymentModel.js";
import * as requestRepo from "../repository/scheduleUpdateRequestRepository.js"; // Import added

export const startCronJobs = () => {
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
          {
            type: "SCHEDULE_REQUEST",
            name: { $in: ["EXPIRED", "APPLIED", "PENDING_OWNER_APPROVAL"] },
          },
          { type: "SCHEDULE_DAY", name: { $in: ["REJECTED", "APPROVED"] } },
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

      // 1. Expire PENDING_BARBER and PENDING_CUSTOMER
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

      // 2. Expire PENDING_BARBER_APPROVAL
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

      // 3. Expire PENDING_CUSTOMER_RESCHEDULE
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

      // 4. SCHEDULE REQUEST: Auto-Expire after 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const expiredRequests =
        await requestRepo.findExpiredRequests(sevenDaysAgo);

      const expiredOverallStatusId = getStatusId("EXPIRED", "SCHEDULE_REQUEST");
      const rejectedDayStatusId = getStatusId("REJECTED", "SCHEDULE_DAY");

      for (const req of expiredRequests) {
        req.requestedChanges.forEach((day) => {
          day.statusId = rejectedDayStatusId;
        });
        req.overallStatusId = expiredOverallStatusId;
        await req.save();
      }

      // 5. SCHEDULE REQUEST: Apply Approved Changes
      const readyRequests = await requestRepo.findReadyToApplyRequests(now);
      const appliedOverallStatusId = getStatusId("APPLIED", "SCHEDULE_REQUEST");

      for (const req of readyRequests) {
        for (const day of req.requestedChanges) {
          // Optimized: Status fetch ki zaroorat nahi, statusDocs se check karlo
          const dayStatus = statusDocs.find(
            (s) => s._id.toString() === day.statusId.toString(),
          );
          if (dayStatus && dayStatus.name === "APPROVED") {
            await requestRepo.upsertBarberSchedule(req.barberProfileId, {
              dayOfWeek: day.dayOfWeek,
              startTime: day.startTime,
              endTime: day.endTime,
              breakStart: day.breakStart,
              breakEnd: day.breakEnd,
              isWorkingDay: day.isWorkingDay,
              deletedAt: null,
            });
          }
        }
        req.overallStatusId = appliedOverallStatusId;
        await req.save();
      }
    } catch (error) {
      console.error("Cron Job Error:", error);
    }
  });
};