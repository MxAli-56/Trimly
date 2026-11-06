import {
  getAuth,
  signInWithPhoneNumber,
} from '@react-native-firebase/auth';

const firebaseAuth = getAuth();

let confirmationResult = null;

export const setConfirmation = (confirmation) => {
  confirmationResult = confirmation;
};

export const getConfirmation = () => confirmationResult;

export const clearConfirmation = () => {
  confirmationResult = null;
};

export { firebaseAuth, signInWithPhoneNumber };