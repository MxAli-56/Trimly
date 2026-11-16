import mongoose from "mongoose";
import Booking from "../../model/bookingModel.js";
import Status from "../../model/statusModel.js";
import User from "../../model/userModel.js";

export const calculateCustomerRiskScore = async (customerId) => {
  if (!mongoose.isValidObjectId(customerId)) return 0;

  const customer = await User.findById(customerId).select("loyaltyPoints");
  const loyaltyPoints = customer?.loyaltyPoints || 0;

  // Fetch status IDs for No-Show and Cancelled
  const noShowStatus = await Status.findOne({
    name: "NO_SHOW",
    type: "BOOKING",
  });
  const cancelledStatus = await Status.findOne({
    name: "CANCELLED",
    type: "BOOKING",
  });

  // Aggregation to get counts
  const stats = await Booking.aggregate([
    {
      $match: {
        customerId: new mongoose.Types.ObjectId(customerId),
        deletedAt: null,
      },
    },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        noShows: {
          $sum: { $cond: [{ $eq: ["$statusId", noShowStatus?._id] }, 1, 0] },
        },
        lateCancels: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$statusId", cancelledStatus?._id] },
                  {
                    $regexMatch: {
                      input: { $ifNull: ["$cancelReason", ""] },
                      regex: "LATE_CANCEL",
                    },
                  },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  if (stats.length === 0) return 0; // New customer

  const { totalBookings, noShows, lateCancels } = stats[0];

  // Base Penalty: 50 for No-Show, 30 for Late Cancel
  const basePenalty = noShows * 50 + lateCancels * 30;

  // Base Risk Score (Percentage)
  let baseRiskScore =
    totalBookings > 0 ? (basePenalty / totalBookings) * 10 : 0;
  // *10 isliye kiya taake percentage threshold (0-100) ban jaye aur easily read ho.
  // E.g. 2 bookings, 1 no-show = 50/2 = 25 * 10 = 250 (Cap 100)

  // Loyalty Discount: Har 200 points pe 5 points risk kam
  const loyaltyDiscount = Math.floor(loyaltyPoints / 200) * 5;

  let finalScore = Math.max(0, baseRiskScore - loyaltyDiscount);

  // Cap at 100
  return Math.min(100, Math.round(finalScore));
};