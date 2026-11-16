import * as barberService from "../services/barber/barberScheduleService.js";
import * as barberAvailabilityService from "../services/barber/barberAvailabilityService.js";
import * as barberDashboardService from "../services/barber/barberDashboardService.js";
import * as barberProfileService from "../services/barber/barberProfileService.js";

export const GetSchedule = async (req, res) => {
  try {
    const userId = req.user.id; // Auth middleware se aayega
    const schedule = await barberService.getBarberSchedule(userId);
    return res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    if (error.message === "PROFILE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: {
          code: "PROFILE_NOT_FOUND",
          message: "Barber profile not found",
        },
      });
    }
    return res.status(500).json({
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
    return res.status(200).json({
      success: true,
      message: "Schedule updated successfully",
      data: updated,
    });
  } catch (error) {
    if (error.message === "INVALID_BREAK_TIME") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_BREAK_TIME",
          message: "Both breakStart and breakEnd must be provided",
        },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error" },
    });
  }
};

export const ToggleAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isAvailable } = req.body;

    const updatedProfile = await barberAvailabilityService.toggleAvailability(
      userId,
      isAvailable,
    );
    return res.status(200).json({
      success: true,
      message: "Availability updated",
      data: updatedProfile,
    });
  } catch (error) {
    if (error.message === "PROFILE_NOT_FOUND")
      return res.status(404).json({
        success: false,
        error: { code: error.message, message: "Profile not found" },
      });
    if (error.message === "INVALID_INPUT")
      return res.status(400).json({
        success: false,
        error: {
          code: error.message,
          message: "isAvailable must be a boolean",
        },
      });
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error" },
    });
  }
};

export const AddLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const leaveData = req.body;

    const leave = await barberAvailabilityService.addTemporaryLeave(
      userId,
      leaveData,
    );
    return res.status(201).json({
      success: true,
      message: "Leave added successfully",
      data: leave,
    });
  } catch (error) {
    if (error.message === "PROFILE_NOT_FOUND")
      return res.status(404).json({
        success: false,
        error: { code: error.message, message: "Profile not found" },
      });
    if (error.message === "INVALID_TIME_RANGE")
      return res.status(400).json({
        success: false,
        error: {
          code: error.message,
          message: "End time must be greater than start time",
        },
      });
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error" },
    });
  }
};

export const GetLeaves = async (req, res) => {
  try {
    const userId = req.user.id;
    const leaves = await barberAvailabilityService.getMyLeaves(userId);
    return res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    if (error.message === "PROFILE_NOT_FOUND")
      return res.status(404).json({
        success: false,
        error: { code: error.message, message: "Profile not found" },
      });
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error" },
    });
  }
};

export const DeleteLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { leaveId } = req.params;
    await barberAvailabilityService.removeLeave(userId, leaveId);
    return res
      .status(200)
      .json({ success: true, message: "Leave removed successfully" });
  } catch (error) {
    if (error.message === "PROFILE_NOT_FOUND")
      return res.status(404).json({
        success: false,
        error: { code: error.message, message: "Profile not found" },
      });
    if (error.message === "LEAVE_NOT_FOUND")
      return res.status(404).json({
        success: false,
        error: { code: error.message, message: "Leave not found" },
      });
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error" },
    });
  }
};

export const GetDailyTimeline = async (req, res) => {
  try {
    const userId = req.user.id;
    const dateString = req.query.date; // e.g., ?date=2026-11-15

    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_DATE", message: "Date must be YYYY-MM-DD" },
      });
    }

    const timeline = await barberDashboardService.getBarberDailyTimeline(
      userId,
      dateString,
    );

    return res.status(200).json({
      success: true,
      data: timeline,
    });
  } catch (error) {
    if (error.message === "PROFILE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: {
          code: "PROFILE_NOT_FOUND",
          message: "Barber profile not found",
        },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error" },
    });
  }
};

export const GetUpcomingBookings = async (req, res) => {
  try {
    const barberUserId = req.user.id;
    const result = await barberDashboardService.getBarberUpcomingBookings(
      barberUserId,
      req.query,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.message === "INVALID_PAGINATION") {
      return res.status(400).json({
        success: false,
        error: {
          code: error.message,
          message: "Invalid page or limit values",
        },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error" },
    });
  }
};

export const GetCompletedBookings = async (req, res) => {
  try {
    const result = await barberDashboardService.getCompletedBookings(
      req.user.id,
      req.query,
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const GetTodayAppointments = async (req, res) => {
  try {
    const barberUserId = req.user.id;
    const result = await barberDashboardService.getTodayAppointments(barberUserId);
    
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } });
  }
};

export const GetMyProfile = async (req, res) => {
  try {
    const profile = await barberProfileService.getMyProfile(req.user.id);
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    if (error.message === "PROFILE_NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const UpdateMyProfile = async (req, res) => {
  try {
    const updated = await barberProfileService.updateMyProfile(
      req.user.id,
      req.body,
    );
    return res
      .status(200)
      .json({ success: true, message: "Profile updated", data: updated });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
