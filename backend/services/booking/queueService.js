import mongoose from "mongoose";
import BookingQueue from "../../model/bookingQueueModel.js";
import Status from "../../model/statusModel.js";
import * as queueRepository from "../../repository/bookingQueueRepository.js";

const MAX_QUEUE_SIZE = 10;

export const addToQueue = async ({
  barberId,
  branchId,
  customerId,
  bookingDate,
  startTime,
  endTime,
  serviceIds,
}) => {
  // 1. Check duplicate
  const existing = await queueRepository.findExistingQueueEntry(
    customerId,
    barberId,
    bookingDate,
    startTime,
  );
  if (existing) {
    return {
      queued: true,
      queueId: existing._id,
      position: existing.position,
      message: `You are already in queue at position #${existing.position}.`,
      alreadyQueued: true,
    };
  }

  // 2. Check queue size
  const currentCount = await queueRepository.countQueuePosition(
    barberId,
    bookingDate,
    startTime,
  );
  if (currentCount >= MAX_QUEUE_SIZE) {
    throw new Error("QUEUE_FULL");
  }

  // 3. Create queue entry
  const waitingStatus = await Status.findOne({
    name: "WAITING",
    type: "QUEUE",
  });
  if (!waitingStatus) throw new Error("QUEUE_STATUS_NOT_FOUND");

  const entry = await queueRepository.createQueueEntry({
    barberId,
    branchId,
    customerId,
    bookingDate,
    startTime,
    endTime,
    serviceIds,
    statusId: waitingStatus._id,
    position: currentCount + 1,
  });

  return {
    queued: true,
    queueId: entry._id,
    position: entry.position,
    message: `Slot is currently held. You are #${entry.position} in queue. We'll notify you when a slot opens.`,
  };
};

export const getQueueStatus = async (queueId, customerId) => {
  if (!mongoose.isValidObjectId(queueId)) throw new Error("INVALID_QUEUE_ID");

  const queue = await queueRepository.findQueueById(queueId);
  if (!queue) throw new Error("QUEUE_NOT_FOUND");
  if (String(queue.customerId) !== String(customerId))
    throw new Error("UNAUTHORIZED");

  return {
    queueId: queue._id,
    status: queue.statusId.name,
    position: queue.position,
    promotedBookingId: queue.promotedBookingId,
    notifiedAt: queue.notifiedAt,
    startTime: queue.startTime,
    bookingDate: queue.bookingDate,
  };
};