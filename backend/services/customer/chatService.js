export const getMyConversations = async (userId, filters = {}) => {
  // TODO: Get conversations in which this user participates.
  throw new Error("NOT_IMPLEMENTED");
};

export const startConversation = async (userId, payload) => {
  // TODO: Validate the other participant and prevent duplicate conversations.
  throw new Error("NOT_IMPLEMENTED");
};

export const getConversationMessages = async (
  userId,
  conversationId,
  filters = {}
) => {
  // TODO: Verify participation, then get paginated messages.
  throw new Error("NOT_IMPLEMENTED");
};

export const sendMessage = async (userId, conversationId, payload) => {
  // TODO: Verify participation and validate message content.
  throw new Error("NOT_IMPLEMENTED");
};

export const markConversationRead = async (userId, conversationId) => {
  // TODO: Mark eligible messages as read.
  throw new Error("NOT_IMPLEMENTED");
};