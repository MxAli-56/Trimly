import mongoose from "mongoose";
import * as requestRepo from "../../repository/scheduleUpdateRequestRepository.js";
import * as barberProfileRepository from "../../repository/barberProfileRepository.js";
import Status from "../../model/statusModel.js";

export const createScheduleRequest = async (userId, scheduleData) => {
  const profile = await barberProfileRepository.findProfileByUserId(userId);
  if (!profile) throw new Error("PROFILE_NOT_FOUND");

  const existing = await requestRepo.findPendingRequestByBarber(profile._id);
  if (existing) throw new Error("PENDING_REQUEST_EXISTS");

  const dayStatus = await Status.findOne({
    name: "PENDING",
    type: "SCHEDULE_DAY",
  });
  const overallStatus = await Status.findOne({
    name: "PENDING_OWNER_APPROVAL",
    type: "SCHEDULE_REQUEST",
  });

  const requestedChanges = scheduleData.map((day) => ({
    ...day,
    statusId: dayStatus._id,
  }));

  const effectiveDate = new Date();
  effectiveDate.setDate(effectiveDate.getDate() + 7);

  const request = await requestRepo.createRequest({
    barberProfileId: profile._id,
    branchId: profile.currentBranchId,
    requestedChanges,
    overallStatusId: overallStatus._id,
    effectiveDate,
  });

  return request;
};

export const ownerReviewRequest = async (
  ownerUserId,
  requestId,
  approvedDays,
  rejectedDays,
) => {
  const request = await requestRepo.findRequestById(requestId);
  if (!request) throw new Error("REQUEST_NOT_FOUND");
  if (request.overallStatusId.name !== "PENDING_OWNER_APPROVAL")
    throw new Error("ALREADY_REVIEWED");

  const approvedDayStatus = await Status.findOne({
    name: "APPROVED",
    type: "SCHEDULE_DAY",
  });
  const rejectedDayStatus = await Status.findOne({
    name: "REJECTED",
    type: "SCHEDULE_DAY",
  });

  let approvedCount = 0;
  let rejectedCount = 0;

  request.requestedChanges.forEach((day) => {
    if (approvedDays.includes(day.dayOfWeek)) {
      day.statusId = approvedDayStatus._id;
      approvedCount++;
    } else if (rejectedDays.includes(day.dayOfWeek)) {
      day.statusId = rejectedDayStatus._id;
      rejectedCount++;
    }
  });

  let newOverallStatusName;
  if (approvedCount === request.requestedChanges.length)
    newOverallStatusName = "FULLY_APPROVED";
  else if (rejectedCount === request.requestedChanges.length)
    newOverallStatusName = "REJECTED";
  else newOverallStatusName = "PARTIALLY_APPROVED";

  const newOverallStatus = await Status.findOne({
    name: newOverallStatusName,
    type: "SCHEDULE_REQUEST",
  });

  request.overallStatusId = newOverallStatus._id;
  request.reviewedBy = ownerUserId;
  request.reviewedAt = new Date();

  await requestRepo.saveRequest(request);
  return request;
};

export const getBarberRequests = async (userId) => {
  const profile = await barberProfileRepository.findProfileByUserId(userId);
  if (!profile) throw new Error("PROFILE_NOT_FOUND");
  return await requestRepo.findRequestsByBarber(profile._id);
};