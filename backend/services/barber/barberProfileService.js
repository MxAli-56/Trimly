import * as barberProfileRepository from "../../repository/barberProfileRepository.js";

export const getMyProfile = async (userId) => {
  const profile = await barberProfileRepository.findProfileByUserId(userId);
  if (!profile) throw new Error("PROFILE_NOT_FOUND");
  return profile;
};

export const updateMyProfile = async (userId, updateData) => {
  const profile = await barberProfileRepository.findProfileByUserId(userId);
  if (!profile) throw new Error("PROFILE_NOT_FOUND");

  // Sirf allowed fields update hone do
  const allowedUpdates = {
    bio: updateData.bio,
    specialties: updateData.specialties,
  };

  return await barberProfileRepository.updateBarberProfile(
    profile._id,
    allowedUpdates,
  );
};