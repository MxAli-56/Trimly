
import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    itemType: {
      type: String,
      enum: ["BARBER", "SALON"],
      required: true,
    },
  },
  { timestamps: true }
);

favoriteSchema.index(
  { customerId: 1, itemType: 1, itemId: 1 },
  { unique: true }
);

const Favorite =
  mongoose.models.Favorite ||
  mongoose.model("Favorite", favoriteSchema);

export default Favorite;
