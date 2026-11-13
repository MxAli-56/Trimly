import * as barberService from "../services/barber/barberScheduleService.js";

export const GetSchedule = async (req, res) => {
  try {
    const userId = req.user.id; // Auth middleware se aayega
    const schedule = await barberService.getBarberSchedule(userId);
    return res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    if (error.message === "PROFILE_NOT_FOUND") {
      return res
        .status(404)
        .json({
          success: false,
          error: {
            code: "PROFILE_NOT_FOUND",
            message: "Barber profile not found",
          },
        });
    }
    return res
      .status(500)
      .json({
        success: false,
        error: { code: "SERVER_ERROR", message: "Internal server error" },
      });
  }
};

export const SetSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const scheduleData = req.body;
    const updated = await barberService.setBarberSchedule(userId, scheduleData);
    return res
      .status(200)
      .json({
        success: true,
        message: "Schedule updated successfully",
        data: updated,
      });
  } catch (error) {
    if (error.message === "INVALID_BREAK_TIME") {
      return res
        .status(400)
        .json({
          success: false,
          error: {
            code: "INVALID_BREAK_TIME",
            message: "Both breakStart and breakEnd must be provided",
          },
        });
    }
    return res
      .status(500)
      .json({
        success: false,
        error: { code: "SERVER_ERROR", message: "Internal server error" },
      });
  }
};