
import mongoose from "mongoose";
import * as userRepository from "../../repository/customer/userRepository.js";

const notImplemented = () => {
  const error = new Error("NOT_IMPLEMENTED");
  throw error;
};


export const getCustomerProfile = async (userId) => {
  if (!userId) {
    const error = new Error("User ID is required");
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error("Invalid user ID");
    error.statusCode = 400;
    throw error;
  }

  const customer = await userRepository.findCustomerProfileById(userId);

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  return customer;
};

export const updateCustomerProfile = async (userId, body = {}) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error("Invalid user ID");
    error.statusCode = 400;
    throw error;
  }

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    const error = new Error("Invalid request body");
    error.statusCode = 400;
    throw error;
  }

  const allowedFields = ["name", "phone"];
  const requestedFields = Object.keys(body);

  if (requestedFields.length === 0) {
    const error = new Error("At least one field is required");
    error.statusCode = 400;
    throw error;
  }

  const invalidFields = requestedFields.filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    const error = new Error(
      `Fields not allowed: ${invalidFields.join(", ")}`
    );
    error.statusCode = 400;
    throw error;
  }

  const updateData = {};

  if (Object.hasOwn(body, "name")) {
    if (
      typeof body.name !== "string" ||
      !body.name.trim()
    ) {
      const error = new Error("Valid name is required");
      error.statusCode = 400;
      throw error;
    }

    updateData.name = body.name.trim();
  }

  if (Object.hasOwn(body, "phone")) {
    if (
      typeof body.phone !== "string" ||
      !body.phone.trim()
    ) {
      const error = new Error("Valid phone number is required");
      error.statusCode = 400;
      throw error;
    }

    updateData.phone = body.phone.trim();
  }

  try {
    const customer =
      await userRepository.updateCustomerProfileById(
        userId,
        updateData
      );

    if (!customer) {
      const error = new Error("Customer not found");
      error.statusCode = 404;
      throw error;
    }

    return customer;
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error(
        "Phone number is already registered"
      );
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    if (error.name === "ValidationError") {
      error.statusCode = 400;
    }

    throw error;
  }
};