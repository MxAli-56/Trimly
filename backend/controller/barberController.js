import * as barberService from "../services/barber/barberScheduleService.js";
import * as barberAvailabilityService from "../services/barber/barberAvailabilityService.js";

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

export const ToggleAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isAvailable } = req.body;
    
    const updatedProfile = await barberAvailabilityService.toggleAvailability(userId, isAvailable);
    return res.status(200).json({ success: true, message: "Availability updated", data: updatedProfile });
  } catch (error) {
    if (error.message === "PROFILE_NOT_FOUND") return res.status(404).json({ success: false, error: { code: error.message, message: "Profile not found" } });
    if (error.message === "INVALID_INPUT") return res.status(400).json({ success: false, error: { code: error.message, message: "isAvailable must be a boolean" } });
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } });
  }
};

export const AddLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const leaveData = req.body;
    
    const leave = await barberAvailabilityService.addTemporaryLeave(userId, leaveData);
    return res.status(201).json({ success: true, message: "Leave added successfully", data: leave });
  } catch (error) {
    if (error.message === "PROFILE_NOT_FOUND") return res.status(404).json({ success: false, error: { code: error.message, message: "Profile not found" } });
    if (error.message === "INVALID_TIME_RANGE") return res.status(400).json({ success: false, error: { code: error.message, message: "End time must be greater than start time" } });
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } });
  }
};

export const GetLeaves = async (req, res) => {
  try {
    const userId = req.user.id;
    const leaves = await barberAvailabilityService.getMyLeaves(userId);
    return res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    if (error.message === "PROFILE_NOT_FOUND") return res.status(404).json({ success: false, error: { code: error.message, message: "Profile not found" } });
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } });
  }
};

export const DeleteLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { leaveId } = req.params;
    await barberAvailabilityService.removeLeave(userId, leaveId);
    return res.status(200).json({ success: true, message: "Leave removed successfully" });
  } catch (error) {
    if (error.message === "PROFILE_NOT_FOUND") return res.status(404).json({ success: false, error: { code: error.message, message: "Profile not found" } });
    if (error.message === "LEAVE_NOT_FOUND") return res.status(404).json({ success: false, error: { code: error.message, message: "Leave not found" } });
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } });
  }
};