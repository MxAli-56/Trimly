
import BarberProfile from "../model/barberProfileModel.js";
import BarberSchedule from "../model/barberScheduleModel.js";
import Booking from "../model/bookingModel.js";
import Service from "../model/serviceModel.js";

// Find barber using BarberProfile ID
export const findBarberProfile = async (barberProfileId) => {
  return await BarberProfile.findOne({
    _id: barberProfileId,
    deletedAt: null,
  }).lean();
};

// Find schedule for specific weekday
export const findScheduleByDay = async (
  barberProfileId,
  dayOfWeek
) => {
  return await BarberSchedule.findOne({
    barberProfileId,
    dayOfWeek,
    isWorkingDay: true,
    deletedAt: null,
  }).lean();
};

// Find active service
export const findActiveService = async (serviceId) => {
  return await Service.findOne({
    _id: serviceId,
    isActive: true,
    deletedAt: null,
  }).lean();
};

// Find existing bookings
export const findBookingsForDate = async (
  barberUserId,
  dateStart,
  dateEnd
) => {
  return await Booking.find({
    barberId: barberUserId,
    bookingDate: {
      $gte: dateStart,
      $lt: dateEnd,
    },
    deletedAt: null,
  })
    .select("startTime endTime statusId holdExpiresAt")
    .lean();
};
