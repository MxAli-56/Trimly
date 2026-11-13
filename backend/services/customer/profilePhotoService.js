
import mongoose from "mongoose";
import cloudinary from "../../config/cloudinary.js";
import * as userRepository from "../../repository/customer/userRepository.js";

// ==========================================
// Upload Image Buffer to Cloudinary
// ==========================================

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

// ==========================================
// API #12 - Upload Profile Photo
// ==========================================

export const uploadProfilePhoto = async (userId, file) => {
  // Step 1: Validate User ID
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error("Invalid user ID");
    error.statusCode = 400;
    throw error;
  }

  // Step 2: Validate Image
  if (!file || !file.buffer) {
    const error = new Error("Please select a profile photo");
    error.statusCode = 400;
    throw error;
  }

  // Step 3: Find User from Repository
  const user = await userRepository.findActiveUserById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Step 4: Upload New Image to Cloudinary
  const uploadedImage = await uploadBufferToCloudinary(
    file.buffer
  );

  // Step 5: Save Previous Image Public ID
  const oldPublicId = user.profilePhotoPublicId;

  // Step 6: Update User Profile
  user.profilePhoto = uploadedImage.secure_url;
  user.profilePhotoPublicId = uploadedImage.public_id;

  try {
    await user.save();
  } catch (error) {
    // Remove newly uploaded image if DB update fails
    try {
      await cloudinary.uploader.destroy(
        uploadedImage.public_id
      );
    } catch (cleanupError) {
      console.error(
        "New image cleanup failed:",
        cleanupError
      );
    }

    throw error;
  }

  // Step 7: Delete Previous Image from Cloudinary
  if (
    oldPublicId &&
    oldPublicId !== uploadedImage.public_id
  ) {
    try {
      await cloudinary.uploader.destroy(oldPublicId);
    } catch (error) {
      console.error(
        "Old profile image cleanup failed:",
        error
      );
    }
  }

  // Step 8: Return Updated Profile Photo
  return {
    profilePhoto: user.profilePhoto,
  };
};



// ==========================================
// API #13 - Delete Profile Photo
// ==========================================

export const deleteProfilePhoto = async (userId) => {
  // Step 1: Validate User ID
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error("Invalid user ID");
    error.statusCode = 400;
    throw error;
  }

  // Step 2: Find active user
  const user = await userRepository.findActiveUserById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Step 3: Check if photo exists
  if (!user.profilePhoto || !user.profilePhotoPublicId) {
    const error = new Error("No profile photo found to delete");
    error.statusCode = 404;
    throw error;
  }

  const publicId = user.profilePhotoPublicId;

  // Step 4: Clear photo reference in MongoDB
  const updatedUser =
    await userRepository.clearCustomerProfilePhoto(
      userId,
      publicId
    );

  if (!updatedUser) {
    const error = new Error(
      "Profile photo was changed. Please try again"
    );
    error.statusCode = 409;
    throw error;
  }

  // Step 5: Delete image from Cloudinary
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result !== "ok" && result.result !== "not found") {
      console.error(
        "Cloudinary photo deletion returned:",
        result
      );
    }
  } catch (error) {
    // Database has already been updated.
    // Log the Cloudinary failure for later cleanup.
    console.error(
      "Cloudinary profile photo cleanup failed:",
      error
    );
  }

  // Step 6: Return success
  return {
    profilePhoto: updatedUser.profilePhoto,
    message: "Profile photo deleted successfully",
  };
};