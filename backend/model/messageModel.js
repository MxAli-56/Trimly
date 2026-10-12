import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: [true, "Conversation reference is required"],
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender reference is required"],
    },
    text: {
      type: String,
      default: "",
      trim: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    messageType: {
      type: String,
      enum: ["TEXT", "IMAGE"],
      default: "TEXT",
      uppercase: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;