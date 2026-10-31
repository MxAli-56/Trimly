import admin from "../../config/firebase.js";
import bcrypt from "bcrypt";
import * as userRepository from "../../repository/userRepository.js";
import { normalizePhoneForDB } from "../../utils/phoneFormatter.js";
import { ROLES } from "../../config/role.js";

export const registerWithOtp = async (idToken, userData) => {
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  const firebasePhone = decodedToken.phone_number;

  if (!firebasePhone) {
    throw new Error("NO_PHONE_NUMBER");
  }

  const localPhone = normalizePhoneForDB(firebasePhone);

  const existingPhone = await userRepository.findByPhone(localPhone);
  if (existingPhone) {
    throw new Error("PHONE_EXISTS");
  }

  const existingEmail = await userRepository.findByEmail(userData.email);
  if (existingEmail) {
    throw new Error("EMAIL_EXISTS");
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const newUser = await userRepository.createUser({
    name: userData.name,
    email: userData.email,
    phone: localPhone,
    password: hashedPassword,
    roles:
      userData.roles && userData.roles.length > 0
        ? userData.roles
        : [ROLES.CUSTOMER],
    cnic: userData.cnic || undefined,
    isVerified: true,
  });

  return {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    roles: newUser.roles,
    cnic: newUser.cnic,
  };
};