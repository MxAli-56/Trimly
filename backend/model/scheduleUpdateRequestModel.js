import mongoose from "mongoose";

const requestedDaySchema = new mongoose.Schema({
  dayOfWeek: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  breakStart: { type: String, default: null },
  breakEnd: { type: String, default: null },
  isWorkingDay: { type: Boolean, required: true },
  statusId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Status", 
    required: true 
  }
}, { _id: false });

const scheduleUpdateRequestSchema = new mongoose.Schema({
  barberProfileId: { type: mongoose.Schema.Types.ObjectId, ref: "BarberProfile", required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  requestedChanges: [requestedDaySchema],
  overallStatusId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Status", 
    required: true 
  },
  effectiveDate: { type: Date, required: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  reviewedAt: { type: Date, default: null },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

const ScheduleUpdateRequest = mongoose.model("ScheduleUpdateRequest", scheduleUpdateRequestSchema);

export default ScheduleUpdateRequest;