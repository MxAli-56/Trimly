import * as scheduleRequestService from "../services/barber/scheduleRequestService.js";

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