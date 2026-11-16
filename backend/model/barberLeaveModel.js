import mongoose from "mongoose";

const barberLeaveSchema = new mongoose.Schema(
  {
    barberProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BarberProfile",
      required: true,
    },
    leaveDate: {
      type: Date, 
      required: true,
    },
    startTime: { type: String, default: null },
    endTime: { type: String, default: null },
    reason: { type: String, required: true }, 
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

barberLeaveSchema.index({ barberProfileId: 1, leaveDate: 1 });
const BarberLeave = mongoose.model("BarberLeave", barberLeaveSchema);
export default BarberLeave;