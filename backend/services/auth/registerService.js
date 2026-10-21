import bcrypt from "bcrypt";
import * as userRepository from "../../repository/userRepository.js";
import { ROLES } from "../../config/role.js";

export const registerUser = async (userData) => {
  const existingEmail = await userRepository.findByEmail(userData.email);
  if (existingEmail) {
    throw new Error("EMAIL_EXISTS");
  }

  const existingPhone = await userRepository.findByPhone(userData.phone);
  if (existingPhone) {
    throw new Error("PHONE_EXISTS");
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const newUser = await userRepository.createUser({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    password: hashedPassword,
    roles:
      userData.roles && userData.roles.length > 0
        ? userData.roles
        : [ROLES.CUSTOMER],
    cnic: userData.cnic || undefined,
  });

  return {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    roles: newUser.roles,
    cnic: newUser.cnic
  };
};