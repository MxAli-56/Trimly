import * as barberProfileRepository from "../repository/barberProfileRepository.js";

export const requireSalonAssociation = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Profile check karo
    const profile = await barberProfileRepository.findProfileByUserId(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: "PROFILE_NOT_FOUND", message: "Barber profile not found." },
      });
    }

    // CurrentBranchId check karo
    if (!profile.currentBranchId) {
      return res.status(403).json({
        success: false,
        error: {
          code: "NO_SALON_ASSOCIATED",
          message: "You have to be a part of a salon to view this.",
        },
      });
    }

    // Agla function (Controller) chalne do
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error during salon check" },
    });
  }
};