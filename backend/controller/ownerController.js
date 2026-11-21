import * as scheduleRequestService from "../services/barber/barberScheduleRequestService.js";
import * as ownerSetScheduleService from "../services/owner/ownerSetScheduleService.js";
import * as ownerSalonBarberService from "../services/owner/ownerSalonBarberService.js";

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
    const result = await ownerSetScheduleService.setBarberScheduleByOwner(ownerId, barberProfileId, schedule);
    return res.status(200).json({ success: true, message: "Schedule set successfully", data: result });
  } catch (error) {
    if (error.message === "UNAUTHORIZED") return res.status(403).json({ success: false, message: "Barber does not belong to your salon" });
    if (error.message === "INVALID_SCHEDULE") return res.status(400).json({ success: false, message: "Invalid schedule data" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const AddBarber = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { branchId, phoneNumber } = req.body;

    const profile = await ownerSalonBarberService.addBarberToSalon(
      ownerId,
      branchId,
      phoneNumber,
    );

    return res.status(201).json({
      success: true,
      message: "Barber added to salon successfully",
      data: profile,
    });
  } catch (error) {
    if (error.message === "BRANCH_NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Salon not found" });
    if (error.message === "UNAUTHORIZED")
      return res
        .status(403)
        .json({ success: false, message: "This salon does not belong to you" });
    if (error.message === "USER_NOT_FOUND")
      return res
        .status(404)
        .json({
          success: false,
          message: "No user found with this phone number",
        });
    if (error.message === "USER_NOT_BARBER")
      return res
        .status(400)
        .json({
          success: false,
          message: "This user is not registered as a Barber",
        });
    if (error.message === "ALREADY_IN_SALON")
      return res
        .status(409)
        .json({
          success: false,
          message: "This barber is already working at a salon",
        });
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const RemoveBarber = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { barberProfileId } = req.params;
    const { reason } = req.body;

    const profile = await ownerService.removeBarberFromSalon(ownerId, barberProfileId, reason);

    return res.status(200).json({
      success: true,
      message: "Barber removed from salon successfully",
      data: profile,
    });
  } catch (error) {
    if (error.message === "BRANCH_NOT_FOUND") return res.status(404).json({ success: false, message: "Salon not found" });
    if (error.message === "PROFILE_NOT_FOUND") return res.status(404).json({ success: false, message: "Barber profile not found" });
    if (error.message === "UNAUTHORIZED") return res.status(403).json({ success: false, message: "This barber does not belong to your salon" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};