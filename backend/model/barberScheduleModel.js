import mongoose from "mongoose";

const barberScheduleSchema = new mongoose.Schema(
  {
    barberProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BarberProfile",
      required: [true, "Barber profile reference is required"],
    },
    dayOfWeek: {
      type: String,
      required: [true, "Day of week is required"],
      enum: [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ],
      uppercase: true,
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Please enter a valid time format (HH:MM)",
      ],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Please enter a valid time format (HH:MM)",
      ],
    },
    breakStart: {
      type: String,
      default: null,
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Please enter a valid time format (HH:MM)",
      ],
    },
    breakEnd: {
      type: String,
      default: null,
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Please enter a valid time format (HH:MM)",
      ],
    },
    isWorkingDay: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

barberScheduleSchema.index(
  { barberProfileId: 1, dayOfWeek: 1 },
  { unique: true },
);

const BarberSchedule = mongoose.model("BarberSchedule", barberScheduleSchema);

export default BarberSchedule;