
import BarberProfile from "../../model/barberProfileModel.js";
import BarberSchedule from "../../model/barberScheduleModel.js";
import Booking from "../../model/bookingModel.js";

// Get barber profile
export const findActiveBarberProfile = async (barberId) => {
  return await BarberProfile.findOne({
    _id: barberId,
    deletedAt: null,
  }).lean();
};

// Get barber schedule
export const findBarberSchedule = async (barberId) => {
  return await BarberSchedule.findOne({
    barberId,
  }).lean();
};

// Get current active booking
export const findCurrentBooking = async (
  barberId,
  currentTime
) => {
  return await Booking.findOne({
    barberId,
    status: {
      $in: ["CONFIRMED", "IN_PROGRESS"],
    },
    startTime: { $lte: currentTime },
    endTime: { $gt: currentTime },
  }).lean();
};




// Get barber profile by ID
export const findBarberProfileForAvailability = async (
  barberId
) => {
  return await BarberProfile.findOne({
    _id: barberId,
    deletedAt: null,
  })
    .select("_id userId branchId isActive")
    .lean();
};

// Get all schedules for barber
export const findBarberSchedules = async (barberId) => {
  return await BarberSchedule.find({
    barberId,
  })
    .sort({ createdAt: 1 })
    .lean();
};
