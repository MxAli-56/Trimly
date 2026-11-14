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
      
      // 1. Expire PENDING_BARBER and PENDING_CUSTOMER
      const expiredStatus = await Status.findOne({ name: "EXPIRED", type: "BOOKING" });
      const res = await Booking.updateMany(
        { 
          statusId: { $in: [ (await Status.findOne({ name: "PENDING_BARBER" }))._id, (await Status.findOne({ name: "PENDING_CUSTOMER" }))._id ] },
          holdExpiresAt: { $lt: now },
          deletedAt: null
        },
        { $set: { statusId: expiredStatus._id, holdExpiresAt: null } }
      );

      // 2. Expire PENDING_BARBER_APPROVAL (Off-peak, auto reject if < 1 hr before booking)
      const pendingApprovalStatus = await Status.findOne({ name: "PENDING_BARBER_APPROVAL" });
      const offPeakBookings = await Booking.find({ statusId: pendingApprovalStatus._id, deletedAt: null }).populate("statusId");
      
      for (const b of offPeakBookings) {
        const bookingDateTime = new Date(`${b.bookingDate.toISOString().split("T")[0]}T${b.startTime}:00.000+05:00`);
        const oneHourBefore = new Date(bookingDateTime.getTime() - 60 * 60 * 1000);
        
        if (now > oneHourBefore) {
          const cancelledStatus = await Status.findOne({ name: "CANCELLED" });
          await Booking.findByIdAndUpdate(b._id, { statusId: cancelledStatus._id });
          
          const refundStatus = await Status.findOne({ name: "PENDING", type: "REFUND" });
          const payment = await Payment.findOne({ bookingId: b._id });
          if (payment) {
            await Refund.create({
              bookingId: b._id,
              paymentId: payment._id,
              amount: b.depositAmount,
              reason: "Barber failed to respond 1 hour before booking",
              statusId: refundStatus._id,
            });
          }
        }
      }
      
      // Note: For PENDING_CUSTOMER_RESCHEDULE, the cron job logic will be similar based on holdExpiresAt.
      
    } catch (error) {
      console.error("Cron Job Error:", error);
    }
  });
};