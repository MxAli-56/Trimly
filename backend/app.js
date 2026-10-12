import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";

dotenv.config({ path: "../.env" });

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Trimly API is live and running!",
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});