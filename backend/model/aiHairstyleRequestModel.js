import mongoose from "mongoose";

const aiHairstyleRequestSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer reference is required"],
    },
    inputImageUrl: {
      type: String,
      required: [true, "Input image URL is required"],
    },
    detectedFaceShape: {
      type: String,
      default: null,
      trim: true,
    },
    recommendedStyles: [
      {
        styleName: {
          type: String,
          required: true,
        },
        description: String,
        imageUrl: String,
      },
    ],
    rawAiResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

aiHairstyleRequestSchema.index({ customerId: 1 });

const AiHairstyleRequest = mongoose.model(
  "AiHairstyleRequest",
  aiHairstyleRequestSchema,
);

export default AiHairstyleRequest;