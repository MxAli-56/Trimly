export const createReview = async (userId, payload) => {
  // TODO: Validate completed booking and review ownership.
  // TODO: Prevent duplicate reviews for the same booking.
  // TODO: Save review and update rating aggregates if required.
  throw new Error("NOT_IMPLEMENTED");
};

export const getMyReviews = async (userId, filters = {}) => {
  // TODO: Get reviews created by this customer.
  throw new Error("NOT_IMPLEMENTED");
};

export const getBranchReviews = async (branchId, filters = {}) => {
  // TODO: Get reviews for a salon branch.
  throw new Error("NOT_IMPLEMENTED");
};

export const getBarberReviews = async (barberId, filters = {}) => {
  // TODO: Get reviews for a barber.
  throw new Error("NOT_IMPLEMENTED");
};