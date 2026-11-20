import * as scheduleRequestService from "../services/barber/barberScheduleRequestService.js";
import * as ownerService from "../services/owner/ownerSetScheduleService.js";

export const ReviewScheduleRequest = async (req, res) => {
  try {
    const { approvedDays, rejectedDays } = req.body;
    const request = await scheduleRequestService.ownerReviewRequest(
      req.user.id,
      req.params.requestId,
      approvedDays,
      rejectedDays,
    );
    return res
      .status(200)
      .json({
        success: true,
        message: "Request reviewed successfully",
        data: request,
      });
  } catch (error) {
    if (error.message === "REQUEST_NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    if (error.message === "ALREADY_REVIEWED")
      return res
        .status(400)
        .json({ success: false, message: "Request is already reviewed" });
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const GetBarberSchedule = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { barberProfileId } = req.params;
    const schedule = await ownerService.getScheduleByOwner(ownerId, barberProfileId);
    return res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    if (error.message === "UNAUTHORIZED") return res.status(403).json({ success: false, message: "Barber does not belong to your salon" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const SetBarberSchedule = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { barberProfileId } = req.params;
    const { schedule } = req.body;
    const result = await ownerService.setBarberScheduleByOwner(ownerId, barberProfileId, schedule);
    return res.status(200).json({ success: true, message: "Schedule set successfully", data: result });
  } catch (error) {
    if (error.message === "UNAUTHORIZED") return res.status(403).json({ success: false, message: "Barber does not belong to your salon" });
    if (error.message === "INVALID_SCHEDULE") return res.status(400).json({ success: false, message: "Invalid schedule data" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};