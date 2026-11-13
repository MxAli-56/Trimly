
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { createHash } from "node:crypto";
import { setServers } from "node:dns";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { ALL_ROLES, ROLES } from "../config/role.js";
import { ALL_STATUS_TYPES } from "../config/status.js";

import User from "../model/userModel.js";
import Branch from "../model/branchModel.js";
import Category from "../model/categoryModel.js";
import Service from "../model/serviceModel.js";
import BarberProfile from "../model/barberProfileModel.js";
import BarberSchedule from "../model/barberScheduleModel.js";
import Status from "../model/statusModel.js";
import Booking from "../model/bookingModel.js";
import Payment from "../model/paymentModel.js";
import Refund from "../model/refundModel.js";
import Review from "../model/reviewModel.js";
import Favourite from "../model/favouriteModel.js";
import Conversation from "../model/conversationModel.js";
import Message from "../model/messageModel.js";
import AiHairstyleRequest from "../model/aiHairstyleRequestModel.js";
import AuthToken from "../model/authTokenModel.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.resolve(currentDir, "../../.env"),
});

dotenv.config({
  path: path.resolve(currentDir, "../.env"),
});

setServers(["8.8.8.8", "1.1.1.1"]);

const PREFIX = "TRIMLY_SEED_2026";
const TARGET = 7;
const SEED_PASSWORD = "TrimlyTest@2026";

const models = [
  User,
  Branch,
  Category,
  Service,
  BarberProfile,
  BarberSchedule,
  Status,
  Booking,
  Payment,
  Refund,
  Review,
  Favourite,
  Conversation,
  Message,
  AiHairstyleRequest,
  AuthToken,
];

const names = [
  "Ayan", "Bilal", "Hamza", "Danish",
  "Fahad", "Hassan", "Omar", "Usman",
  "Zain", "Rayan", "Saad", "Adeel",
  "Arham", "Farhan", "Salman", "Ibrahim",
  "Noman", "Adnan", "Kashif", "Haris",
  "Taha", "Waleed", "Shayan", "Azlan",
];

const areas = [
  ["Gulshan-e-Iqbal", 67.090, 24.925],
  ["Clifton", 67.025, 24.814],
  ["DHA", 67.060, 24.805],
  ["North Nazimabad", 67.045, 24.945],
  ["Gulistan-e-Johar", 67.115, 24.910],
  ["Saddar", 67.031, 24.860],
  ["PECHS", 67.070, 24.875],
  ["Bahadurabad", 67.067, 24.884],
];

const serviceTypes = [
  ["Classic Haircut", 700, 30],
  ["Beard Trim", 400, 20],
  ["Hair Styling", 900, 40],
  ["Hair Wash", 350, 15],
  ["Fade Haircut", 1000, 35],
  ["Facial", 1400, 45],
  ["Haircut and Beard", 1200, 50],
  ["Head Massage", 550, 25],
];

const days = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const datePlus = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date;
};

const requireRole = (role) => {
  if (!ALL_ROLES.includes(role)) {
    throw new Error(`Invalid role: ${role}`);
  }
  return role;
};

async function upsert(Model, filter, data) {
  const existing = await Model.findOne(filter);

  if (existing) {
    return existing;
  }

  try {
    const created = await Model.create(data);
    console.log(`Created ${Model.modelName}: ${created._id}`);
    return created;
  } catch (error) {
    if (error.code === 11000) {
      const found = await Model.findOne(filter);
      if (found) return found;
    }
    throw error;
  }
}

async function seedAllData() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI missing from .env");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Production seeding is disabled");
  }

  if (process.env.SEED_CONFIRM !== "YES") {
    throw new Error(
      "Set SEED_CONFIRM=YES before running this script"
    );
  }

  await mongoose.connect(process.env.MONGO_URI);

  console.log("\nMongoDB Connected:", mongoose.connection.name);
  console.log("Starting TRIMLY database seeding...\n");

  if (!ALL_STATUS_TYPES?.length) {
    throw new Error("No status types found in config/status.js");
  }

  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

  // ==========================================
  // 1. USERS
  // ==========================================

  console.log("\n===== USERS =====");

  const users = [];

  for (let i = 0; i < 24; i++) {
    const number = i + 1;

    const userRole =
      i < 8
        ? requireRole(ROLES.CUSTOMER)
        : i < 16
          ? requireRole(ROLES.BARBER)
          : requireRole(ROLES.SALON_OWNER);

    const email = `trimly.seed2026.${number}@example.com`;

    const userData = {
      name: `${names[i]} Test`,
      email,
      phone: `0319${String(7000000 + number)}`,
      password: hashedPassword,
      roles: [userRole],
      isVerified: true,
      deletedAt: null,
    };

    if (userRole === ROLES.SALON_OWNER) {
      userData.cnic =
        `42101-${String(8000000 + number)}-${number % 10}`;
    }

    const user = await upsert(
      User,
      { email },
      userData
    );

    users.push(user);
  }

  const customers = users.slice(0, 8);
  const barberUsers = users.slice(8, 16);
  const owners = users.slice(16, 24);

  // ==========================================
  // 2. BRANCHES
  // ==========================================

  console.log("\n===== BRANCHES =====");

  const branches = [];

  for (let i = 0; i < 8; i++) {
    const [area, longitude, latitude] = areas[i];

    const name = `${PREFIX} ${area} Salon`;

    const branch = await upsert(
      Branch,
      {
        name,
        ownerId: owners[i]._id,
      },
      {
        ownerId: owners[i]._id,
        name,
        address: `Shop ${i + 1}, ${area}, Karachi`,
        area,
        city: "Karachi",
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        isOpen: true,
        avgRating: 4.5,
        ratingCount: 8,
        deletedAt: null,
      }
    );

    branches.push(branch);
  }

  // ==========================================
  // 3. CATEGORIES
  // ==========================================

  console.log("\n===== CATEGORIES =====");

  const categories = [];

  for (let i = 0; i < 8; i++) {
    const name = `${PREFIX} Grooming`;

    const category = await upsert(
      Category,
      {
        branchId: branches[i]._id,
        name,
      },
      {
        branchId: branches[i]._id,
        name,
        description: "Hair and grooming services",
        isActive: true,
        deletedAt: null,
      }
    );

    categories.push(category);
  }

  // ==========================================
  // 4. SERVICES
  // ==========================================

  console.log("\n===== SERVICES =====");

  const services = [];

  for (let i = 0; i < 8; i++) {
    const [serviceName, price, duration] = serviceTypes[i];

    const name = `${PREFIX} ${serviceName}`;

    const service = await upsert(
      Service,
      {
        branchId: branches[i]._id,
        name,
      },
      {
        branchId: branches[i]._id,
        categoryId: categories[i]._id,
        name,
        description: `Professional ${serviceName}`,
        price,
        durationMinutes: duration,
        isActive: true,
        deletedAt: null,
      }
    );

    services.push(service);
  }

  // ==========================================
  // 5. BARBER PROFILES
  // ==========================================

  console.log("\n===== BARBER PROFILES =====");

  const profiles = [];

  for (let i = 0; i < 8; i++) {
    const profile = await upsert(
      BarberProfile,
      {
        userId: barberUsers[i]._id,
      },
      {
        userId: barberUsers[i]._id,
        branchId: branches[i]._id,
        bio: "Experienced professional barber",
        specialties: [
          "Haircut",
          "Beard Trim",
          "Hair Styling",
        ],
        isAvailable: true,
        avgRating: 4.5,
        ratingCount: 8,
        deletedAt: null,
      }
    );

    profiles.push(profile);
  }

  // ==========================================
  // 6. BARBER SCHEDULES
  // ==========================================

  console.log("\n===== BARBER SCHEDULES =====");

  for (let i = 0; i < 8; i++) {
    await upsert(
      BarberSchedule,
      {
        barberProfileId: profiles[i]._id,
        dayOfWeek: days[i % days.length],
      },
      {
        barberProfileId: profiles[i]._id,
        dayOfWeek: days[i % days.length],
        startTime: "10:00",
        endTime: "20:00",
        breakStart: "14:00",
        breakEnd: "15:00",
        isWorkingDay: true,
        deletedAt: null,
      }
    );
  }

  // ==========================================
  // 7. STATUSES
  // ==========================================

  console.log("\n===== STATUSES =====");

  const statuses = [];

  for (let i = 0; i < 8; i++) {
    const name = `${PREFIX}_STATUS_${i + 1}`;
    const type = ALL_STATUS_TYPES[i % ALL_STATUS_TYPES.length];

    const status = await upsert(
      Status,
      { name, type },
      {
        name,
        type,
        description: "Development testing status",
        deletedAt: null,
      }
    );

    statuses.push(status);
  }

  // ==========================================
  // 8. BOOKINGS
  // ==========================================

  console.log("\n===== BOOKINGS =====");

  const bookings = [];

  for (let i = 0; i < 8; i++) {
    const appointmentCode =
      `TSD26${String(i + 1).padStart(5, "0")}`;

    const booking = await upsert(
      Booking,
      { appointmentCode },
      {
        appointmentCode,
        customerId: customers[i]._id,
        barberId: barberUsers[i]._id,
        branchId: branches[i]._id,
        statusId: statuses[0]._id,
        bookingDate: datePlus(14 + i),
        startTime: "11:00",
        endTime: "12:00",
        services: [
          {
            serviceId: services[i]._id,
            name: services[i].name,
            price: services[i].price,
            durationMinutes: services[i].durationMinutes,
          },
        ],
        totalAmount: services[i].price,
        depositAmount: Math.round(services[i].price * 0.2),
        isOffPeakBooking: false,
        deletedAt: null,
      }
    );

    bookings.push(booking);
  }

  // ==========================================
  // 9. PAYMENTS
  // ==========================================

  console.log("\n===== PAYMENTS =====");

  const payments = [];

  for (let i = 0; i < 8; i++) {
    const transactionId = `${PREFIX}_PAY_${i + 1}`;

    const payment = await upsert(
      Payment,
      { transactionId },
      {
        bookingId: bookings[i]._id,
        statusId: statuses[0]._id,
        paymentGateway: i % 2 === 0 ? "JAZZCASH" : "EASYPAISA",
        transactionId,
        amount: bookings[i].depositAmount,
        rawGatewayResponse: {
          simulated: true,
          message: "Demo payment",
        },
        deletedAt: null,
      }
    );

    payments.push(payment);
  }

  // ==========================================
  // 10. REFUNDS
  // ==========================================

  console.log("\n===== REFUNDS =====");

  for (let i = 0; i < 8; i++) {
    const refundTransactionId =
      `${PREFIX}_REF_${i + 1}`;

    await upsert(
      Refund,
      { refundTransactionId },
      {
        paymentId: payments[i]._id,
        bookingId: bookings[i]._id,
        statusId: statuses[0]._id,
        amount: 0,
        reason: "Test refund simulation",
        refundTransactionId,
        deletedAt: null,
      }
    );
  }

  // ==========================================
  // 11. REVIEWS
  // ==========================================

  console.log("\n===== REVIEWS =====");

  for (let i = 0; i < 8; i++) {
    await upsert(
      Review,
      {
        bookingId: bookings[i]._id,
      },
      {
        bookingId: bookings[i]._id,
        customerId: customers[i]._id,
        barberId: barberUsers[i]._id,
        branchId: branches[i]._id,
        rating: 4 + (i % 2),
        comment: "Excellent service and professional barber",
        deletedAt: null,
      }
    );
  }

  // ==========================================
  // 12. FAVOURITES
  // ==========================================

  console.log("\n===== FAVOURITES =====");

  for (let i = 0; i < 8; i++) {
    await upsert(
      Favourite,
      {
        customerId: customers[i]._id,
        barberId: profiles[i]._id,
      },
      {
        customerId: customers[i]._id,
        barberId: profiles[i]._id,
        salonId: null,
      }
    );
  }

  // ==========================================
  // 13. CONVERSATIONS
  // ==========================================

  console.log("\n===== CONVERSATIONS =====");

  const conversations = [];

  for (let i = 0; i < 8; i++) {
    const conversation = await upsert(
      Conversation,
      {
        participants: {
          $all: [
            customers[i]._id,
            barberUsers[i]._id,
          ],
          $size: 2,
        },
        branchId: branches[i]._id,
      },
      {
        participants: [
          customers[i]._id,
          barberUsers[i]._id,
        ],
        branchId: branches[i]._id,
        lastMessage: `Test conversation ${i + 1}`,
        lastMessageAt: new Date(),
        deletedAt: null,
      }
    );

    conversations.push(conversation);
  }

  // ==========================================
// FAVOURITE SALONS
// ==========================================

console.log("\n===== FAVOURITE SALONS =====");

for (let i = 0; i < 8; i++) {
  await upsert(
    Favourite,
    {
      customerId: customers[i]._id,
      salonId: branches[i]._id,
    },
    {
      customerId: customers[i]._id,
      salonId: branches[i]._id,
      barberId: null,
    }
  );
}
  // ==========================================
  // 14. MESSAGES
  // ==========================================

  console.log("\n===== MESSAGES =====");

  for (let i = 0; i < 8; i++) {
    const text = `${PREFIX} message ${i + 1}`;

    await upsert(
      Message,
      {
        conversationId: conversations[i]._id,
        text,
      },
      {
        conversationId: conversations[i]._id,
        senderId: customers[i]._id,
        text,
        messageType: "TEXT",
        isRead: false,
        deletedAt: null,
      }
    );
  }

  // ==========================================
  // 15. AI HAIRSTYLE REQUESTS
  // ==========================================

  console.log("\n===== AI HAIRSTYLE REQUESTS =====");

  for (let i = 0; i < 8; i++) {
    const inputImageUrl =
      `https://example.com/trimly/hairstyle-${i + 1}.jpg`;

    await upsert(
      AiHairstyleRequest,
      {
        customerId: customers[i]._id,
        inputImageUrl,
      },
      {
        customerId: customers[i]._id,
        inputImageUrl,
        detectedFaceShape: "OVAL",
        recommendedStyles: [
          {
            styleName: "Classic Fade",
            description: "AI generated style recommendation",
            imageUrl:
              `https://example.com/trimly/style-${i + 1}.jpg`,
          },
        ],
        rawAiResponse: {
          simulated: true,
        },
        deletedAt: null,
      }
    );
  }

  // ==========================================
  // 16. AUTH TOKENS
  // ==========================================

  console.log("\n===== AUTH TOKENS =====");

  for (let i = 0; i < 8; i++) {
    const refreshTokenHash = createHash("sha256")
      .update(`${PREFIX}_REVOKED_${i + 1}`)
      .digest("hex");

    await upsert(
      AuthToken,
      { refreshTokenHash },
      {
        userId: customers[i]._id,
        refreshTokenHash,
        isRevoked: true,
        expiresAt: datePlus(365),
        userAgent: "TRIMLY Test Seeder",
        deletedAt: null,
      }
    );
  }

  // ==========================================
  // FINAL DATABASE REPORT
  // ==========================================

  console.log("\n====================================");
  console.log("TRIMLY DATABASE SEEDING REPORT");
  console.log("====================================");

  let total = 0;
  let allTargetsMet = true;

  for (const Model of models) {
    const count = await Model.countDocuments();

    total += count;

    const passed = count >= TARGET;

    if (!passed) allTargetsMet = false;

    console.log(
      `${Model.modelName.padEnd(22)} ${String(count).padStart(4)} ${
        passed ? "OK" : "BELOW TARGET"
      }`
    );
  }

  console.log("------------------------------------");
  console.log("TOTAL DATABASE RECORDS:", total);
  console.log("MINIMUM 7 PER MODEL:", allTargetsMet ? "YES" : "NO");
  console.log("100+ TOTAL RECORDS:", total >= 100 ? "YES" : "NO");

  // ==========================================
  // POSTMAN TESTING IDS
  // ==========================================

  console.log("\n===== POSTMAN TEST DATA =====");

  console.log("Customer Email:", customers[0].email);
  console.log("Customer Password:", SEED_PASSWORD);
  console.log("Customer User ID:", customers[0]._id.toString());
  console.log("Barber User ID:", barberUsers[0]._id.toString());
  console.log("Barber Profile ID:", profiles[0]._id.toString());
  console.log("Salon Branch ID:", branches[0]._id.toString());
  console.log("Service ID:", services[0]._id.toString());
  console.log("Booking ID:", bookings[0]._id.toString());

  console.log("\nFavourite Barber DELETE URL:");
  console.log(
    `http://localhost:5000/api/customer/favorites/barbers/${profiles[0]._id}`
  );

  console.log("\nSeeding process completed.");
}

try {
  await seedAllData();
} catch (error) {
  console.error("\nSEED FAILED:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
  console.log("\nMongoDB connection closed.");
}
