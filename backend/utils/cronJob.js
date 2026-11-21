import cron from "node-cron";
import Booking from "../model/bookingModel.js";
import Status from "../model/statusModel.js";
import Refund from "../model/refundModel.js";
import Payment from "../model/paymentModel.js";
import * as requestRepo from "../repository/scheduleUpdateRequestRepository.js";
import * as queueRepository from "../repository/bookingQueueRepository.js";
import * as serviceRepository from "../repository/serviceRepository.js";
import * as bookingRepository from "../repository/bookingRepository.js";

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
        {
          $set: {
            statusId: getStatusId("EXPIRED"),
            holdExpiresAt: null,
            isActive: false,
          },
        },
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
            isActive: false,
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
          isActive: false,
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

      // 6. QUEUE PROMOTION
      const waitingSlots = await queueRepository.getAllWaitingQueueSlots();

      for (const slot of waitingSlots) {
        if (slot.entries.length === 0) continue;

        // Check if slot is still free
        const dateStart = new Date(
          `${slot.bookingDate.toISOString().split("T")[0]}T00:00:00.000Z`,
        );
        const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);

        const conflicts = await bookingRepository.findOverlappingBookings({
          barberUserId: slot.barberId,
          dateStart,
          dateEnd,
          startTime: slot.startTime,
          endTime: slot.endTime,
        });

        const activeConflict = conflicts.some((b) => {
          const statusName = b.statusId?.name;
          if (
            [
              "CONFIRMED",
              "IN_PROGRESS",
              "COMPLETED",
              "PENDING_CUSTOMER_RESCHEDULE",
              "PENDING_BARBER_APPROVAL",
            ].includes(statusName)
          )
            return true;
          if (["PENDING_BARBER", "PENDING_CUSTOMER"].includes(statusName)) {
            return b.holdExpiresAt && new Date(b.holdExpiresAt) > new Date();
          }
          return false;
        });

        if (activeConflict) continue; // Slot still held, don't promote

        // Slot is free — promote first in line
        const nextInLine = slot.entries[0];
        if (!nextInLine) continue;

        // Check if slot's booking time has already passed
        const bookingDateTime = new Date(
          `${slot.bookingDate.toISOString().split("T")[0]}T${slot.startTime}:00.000+05:00`,
        );
        if (bookingDateTime < now) {
          await queueRepository.expireQueueEntry(nextInLine._id);
          continue;
        }

        // Create real booking for next in line
        try {
          const services = await serviceRepository.findServicesByIds(
            nextInLine.serviceIds,
            nextInLine.branchId,
          );
          if (services.length !== nextInLine.serviceIds.length) {
            await queueRepository.expireQueueEntry(nextInLine._id);
            continue;
          }

          let totalDuration = 0;
          let totalAmount = 0;
          const servicesSnapshot = services.map((s) => {
            totalDuration += s.durationMinutes;
            totalAmount += s.price;
            return {
              serviceId: s._id,
              name: s.name,
              price: s.price,
              durationMinutes: s.durationMinutes,
            };
          });

          const pendingStatus = await Status.findOne({
            name: "PENDING_BARBER",
            type: "BOOKING",
          });
          const holdExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

          const newBooking = await Booking.create({
            appointmentCode: `TRM-${Math.random().toString(36).substring(2, 14).toUpperCase()}`,
            customerId: nextInLine.customerId,
            barberId: nextInLine.barberId,
            branchId: nextInLine.branchId,
            statusId: pendingStatus._id,
            bookingDate: nextInLine.bookingDate,
            startTime: nextInLine.startTime,
            endTime: nextInLine.endTime,
            services: servicesSnapshot,
            totalAmount,
            depositAmount: totalAmount * 0.3,
            isOffPeakBooking: false,
            holdExpiresAt,
            isActive: true,
          });

          // Mark queue as promoted
          await queueRepository.promoteQueueEntry(
            nextInLine._id,
            newBooking._id,
          );

          // Socket notify customer
          try {
            const { getIO } = await import("../config/socket.js");
            getIO()
              .to(`customer:${String(nextInLine.customerId)}`)
              .emit("queue:promoted", {
                queueId: String(nextInLine._id),
                bookingId: String(newBooking._id),
                appointmentCode: newBooking.appointmentCode,
                startTime: nextInLine.startTime,
                holdExpiresAt,
                message: "Your turn! Pay within 2 minutes to confirm.",
              });
          } catch (socketErr) {
            console.error("Queue socket error:", socketErr.message);
          }
        } catch (err) {
          if (err.code === 11000) {
            // Another process beat us — try again next cycle
            console.log("Queue promotion race lost, retrying next cycle");
          } else {
            console.error("Queue promotion error:", err.message);
          }
        }
      }
    } catch (error) {
      console.error("Cron Job Error:", error);
    }
  });
};