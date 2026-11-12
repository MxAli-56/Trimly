
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
      default: null,
    },
    barberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BarberProfile",
      default: null,
    },
  },
  { timestamps: true }
);

favouriteSchema.pre("validate", function () {
  const hasSalon = this.salonId != null;
  const hasBarber = this.barberId != null;

  if (hasSalon === hasBarber) {
    this.invalidate(
      "salonId",
      "Exactly one of salonId or barberId is required"
    );
  }
});

favouriteSchema.index(
  { customerId: 1, salonId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      salonId: { $type: "objectId" },
    },
  }
);

favouriteSchema.index(
  { customerId: 1, barberId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      barberId: { $type: "objectId" },
    },
  }
);

const Favourite =
  mongoose.models.Favourite ||
  mongoose.model("Favourite", favouriteSchema);

export default Favourite;
