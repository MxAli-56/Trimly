import BookingQueue from "../model/bookingQueueModel.js";
import Status from "../model/statusModel.js";

const getQueueStatus = async (name) => {
  const status = await Status.findOne({ name, type: "QUEUE" });
  if (!status) throw new Error(`QUEUE_STATUS_NOT_FOUND_${name}`);
  return status;
};

export const findExistingQueueEntry = async (
  customerId,
  barberId,
  bookingDate,
  startTime,
) => {
  const waitingStatus = await getQueueStatus("WAITING");
  return BookingQueue.findOne({
    customerId,
    barberId,
    bookingDate,
    startTime,
    statusId: waitingStatus._id,
    deletedAt: null,
  });
};

export const countQueuePosition = async (barberId, bookingDate, startTime) => {
  const waitingStatus = await getQueueStatus("WAITING");
  return BookingQueue.countDocuments({
    barberId,
    bookingDate,
    startTime,
    statusId: waitingStatus._id,
    deletedAt: null,
  });
};

export const createQueueEntry = async (data) => {
  return BookingQueue.create(data);
};

export const findQueueById = async (queueId) => {
  return BookingQueue.findOne({ _id: queueId, deletedAt: null })
    .populate("statusId", "name")
    .lean();
};

export const findQueueEntriesBySlot = async (
  barberId,
  bookingDate,
  startTime,
) => {
  const waitingStatus = await getQueueStatus("WAITING");
  return BookingQueue.find({
    barberId,
    bookingDate,
    startTime,
    statusId: waitingStatus._id,
    deletedAt: null,
  })
    .sort({ requestedAt: 1, createdAt: 1 })
    .lean();
};

export const getAllWaitingQueueSlots = async () => {
  const waitingStatus = await getQueueStatus("WAITING");
  const entries = await BookingQueue.find({
    statusId: waitingStatus._id,
    deletedAt: null,
  }).lean();

  // Group by slot
  const slotMap = new Map();
  entries.forEach((entry) => {
    const key = `${entry.barberId}_${entry.bookingDate.toISOString().split("T")[0]}_${entry.startTime}`;
    if (!slotMap.has(key)) {
      slotMap.set(key, {
        barberId: entry.barberId,
        bookingDate: entry.bookingDate,
        startTime: entry.startTime,
        endTime: entry.endTime,
        entries: [],
      });
    }
    slotMap.get(key).entries.push(entry);
  });

  // Sort entries in each slot by requestedAt (FIFO)
  for (const slot of slotMap.values()) {
    slot.entries.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  return Array.from(slotMap.values());
};

export const promoteQueueEntry = async (queueId, bookingId) => {
  const promotedStatus = await getQueueStatus("PROMOTED");
  return BookingQueue.findOneAndUpdate(
    { _id: queueId, deletedAt: null },
    {
      $set: {
        statusId: promotedStatus._id,
        promotedBookingId: bookingId,
        notifiedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );
};

export const expireQueueEntry = async (queueId) => {
  const expiredStatus = await getQueueStatus("EXPIRED");
  return BookingQueue.findOneAndUpdate(
    { _id: queueId, deletedAt: null },
    { $set: { statusId: expiredStatus._id, deletedAt: new Date() } },
    { returnDocument: "after" },
  );
};