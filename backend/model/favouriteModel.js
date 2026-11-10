
import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
  },
  { timestamps: true }
);

favouriteSchema.index(
  { customerId: 1, salonId: 1 },
  { unique: true }
);

const Favourite =
  mongoose.models.Favourite ||
  mongoose.model("Favourite", favouriteSchema);

export default Favourite;
