import "../config/env.js";
import mongoose from "mongoose";
import { mongooseToErdMain } from "mongoose-to-erd";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

import "../model/userModel.js";
import "../model/statusModel.js";
import "../model/reviewModel.js";
import "../model/authTokenModel.js";
import "../model/aiHairstyleRequestModel.js";
import "../model/barberProfileModel.js";
import "../model/barberScheduleModel.js";
import "../model/bookingModel.js";
import "../model/branchModel.js";
import "../model/categoryModel.js";
import "../model/conversationModel.js";
import "../model/messageModel.js";
import "../model/paymentModel.js";
import "../model/refundModel.js";
import "../model/serviceModel.js";

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected. Generating ERD...");

    await mongooseToErdMain(
      mongoose.modelNames(),
      mongoose.model.bind(mongoose),
      { sketch: false, scale: 1 },
    );

    console.log("Done. Check project root for .svg files.");
  } catch (err) {
    console.error("ERD Generation Failed:", err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
