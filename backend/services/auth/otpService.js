import adminAuth from "../../config/firebase.js";
import bcrypt from "bcrypt";
import * as userRepository from "../../repository/customer/userRepository.js";
import { normalizePhoneForDB } from "../../utils/phoneFormatter.js";
import { ROLES } from "../../config/role.js";

const verifyTokenAndGetPhone = async (idToken) => {
  const decodedToken = await adminAuth.verifyIdToken(idToken);
  const firebasePhone = decodedToken.phone_number;
  if (!firebasePhone) throw new Error("NO_PHONE_NUMBER");
  return normalizePhoneForDB(firebasePhone);
};

export const registerWithOtp = async (idToken, userData) => {
  const localPhone = await verifyTokenAndGetPhone(idToken);

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