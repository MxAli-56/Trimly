import User from "../../model/userModel.js";
import cloudinary from "../../config/cloudinary.js";

const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "trimly/profile-photos",
        resource_type: "image",
        transformation: [
          {
            width: 500,
            height: 500,
            crop: "fill",
            gravity: "face",
          },
        ],
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

export const uploadProfilePhoto = async (userId, file) => {
  if (!file) {
    const error = new Error("Please select a profile photo");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({
    _id: userId,
    deletedAt: null,
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Upload the new image first.
  const uploadedImage = await uploadBufferToCloudinary(file.buffer);

  const oldPublicId = user.profilePhotoPublicId;

  user.profilePhoto = uploadedImage.secure_url;
  user.profilePhotoPublicId = uploadedImage.public_id;

  try {
    await user.save();
  } catch (error) {
    // Clean up the new image if saving to MongoDB fails.
    await cloudinary.uploader
      .destroy(uploadedImage.public_id)
      .catch(() => {});

    throw error;
  }

  // Delete the previous image only after the new URL is saved.
  if (oldPublicId) {
    try {
      await cloudinary.uploader.destroy(oldPublicId);
    } catch (error) {
      // The profile update succeeded; log cleanup failure for later.
      console.error("Old profile image cleanup failed:", error);
    }
  }

  return {
    profilePhoto: user.profilePhoto,
  };
};