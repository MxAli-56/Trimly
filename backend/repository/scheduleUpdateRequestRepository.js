import ScheduleUpdateRequest from "../model/scheduleUpdateRequestModel.js";
import BarberSchedule from "../model/barberScheduleModel.js";

export const createRequest = async (data) => {
  return await ScheduleUpdateRequest.create(data);
};

export const findPendingRequestByBarber = async (barberProfileId) => {
  const pendingStatus = await mongoose
    .model("Status")
    .findOne({ name: "PENDING_OWNER_APPROVAL", type: "SCHEDULE_REQUEST" });
  return await ScheduleUpdateRequest.findOne({
    barberProfileId,
    overallStatusId: pendingStatus._id,
    deletedAt: null,
  });
};

export const findRequestsByBarber = async (barberProfileId) => {
  return await ScheduleUpdateRequest.find({ barberProfileId, deletedAt: null })
    .populate("overallStatusId", "name")
    .populate("requestedChanges.statusId", "name")
    .sort({ createdAt: -1 });
};

export const findRequestById = async (requestId) => {
  return await ScheduleUpdateRequest.findOne({
    _id: requestId,
    deletedAt: null,
  })
    .populate("overallStatusId", "name")
    .populate("requestedChanges.statusId", "name");
};

export const saveRequest = async (request) => {
  return await request.save();
};

export const findExpiredRequests = async (cutoffDate) => {
  const pendingStatus = await mongoose
    .model("Status")
    .findOne({ name: "PENDING_OWNER_APPROVAL", type: "SCHEDULE_REQUEST" });
  return await ScheduleUpdateRequest.find({
    overallStatusId: pendingStatus._id,
    createdAt: { $lt: cutoffDate },
    deletedAt: null,
  });
};

export const findReadyToApplyRequests = async (currentDate) => {
  const approvedStatuses = await mongoose.model("Status").find({
    type: "SCHEDULE_REQUEST",
    name: { $in: ["FULLY_APPROVED", "PARTIALLY_APPROVED"] },
  });
  return await ScheduleUpdateRequest.find({
    overallStatusId: { $in: approvedStatuses.map((s) => s._id) },
    effectiveDate: { $lte: currentDate },
    deletedAt: null,
  });
};

export const upsertBarberSchedule = async (barberProfileId, dayData) => {
  return await BarberSchedule.findOneAndUpdate(
    { barberProfileId, dayOfWeek: dayData.dayOfWeek },
    { $set: dayData },
    { upsert: true, returnDocument: "after" },
  );
};