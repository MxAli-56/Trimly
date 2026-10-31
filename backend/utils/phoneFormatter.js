export const normalizePhoneForDB = (phone) => {
  if (!phone) return "";
  let cleaned = phone.replace(/\s+/g, "").replace("+", "");
  if (cleaned.startsWith("92")) {
    return "0" + cleaned.slice(2);
  }
  return cleaned;
};