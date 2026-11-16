import BarberLeave from "../model/barberLeaveModel.js";

export const createLeave = async (leaveData) => {
  return await BarberLeave.create(leaveData);
};

export const findLeavesByProfileId = async (barberProfileId) => {
  return await BarberLeave.find({
    barberProfileId,
    deletedAt: null,
  }).sort({ leaveDate: 1 });
};

export const deleteLeaveById = async (leaveId, barberProfileId) => {
  return await BarberLeave.findOneAndUpdate(
    { _id: leaveId, barberProfileId, deletedAt: null },
    { $set: { deletedAt: new Date() } },
    { new: true },
  );
};