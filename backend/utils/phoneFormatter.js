export const formatPhoneForSMS = (phone) => {
  const cleaned = phone.replace(/\s+/g, "");

  if (cleaned.startsWith("+92")) {
    return cleaned.slice(1);
  }
  if (cleaned.startsWith("92")) {
    return cleaned;
  }
  if (cleaned.startsWith("0")) {
    return "92" + cleaned.slice(1);
  }
  return "92" + cleaned;
};