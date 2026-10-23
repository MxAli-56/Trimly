import { setServers } from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

import User from "../model/userModel.js";
import Branch from "../model/branchModel.js";
import Category from "../model/categoryModel.js";
import Service from "../model/serviceModel.js";
import BarberProfile from "../model/barberProfileModel.js";
import BarberSchedule from "../model/barberScheduleModel.js";

dotenv.config({
  path: "../.env",
});
setServers(["8.8.8.8", "1.1.1.1"]);

const seedTestData = async () => {
  try {
    console.log("🌱 Starting TRIMLY test data seeding...");

    // =========================
    // CONNECT DATABASE
    // =========================

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");

    // =========================
    // SALON OWNER
    // =========================

    let owner = await User.findOne({
      email: "testowner@trimly.com",
    });

    if (!owner) {
      const hashedPassword = await bcrypt.hash(
        "Test@123",
        10,
      );

      owner = await User.create({
        name: "Test Salon Owner",
        email: "testowner@trimly.com",
        phone: "03001234567",
        cnic: "42101-1234567-1",
        password: hashedPassword,
        roles: ["SALON_OWNER"],
        isVerified: true,
        deletedAt: null,
      });

      console.log("✅ Test salon owner created");
    } else {
      console.log("ℹ️ Test salon owner already exists");
    }

    // =========================
    // CUSTOMER
    // =========================

    let customer = await User.findOne({
      email: "testcustomer@trimly.com",
    });

    if (!customer) {
      const hashedPassword = await bcrypt.hash(
        "Test@123",
        10,
      );

      customer = await User.create({
        name: "Test Customer",
        email: "testcustomer@trimly.com",
        phone: "03001234568",
        password: hashedPassword,
        roles: ["CUSTOMER"],
        isVerified: true,
        deletedAt: null,
      });

      console.log("✅ Test customer created");
    } else {
      console.log("ℹ️ Test customer already exists");
    }

    // =========================
    // BRANCH
    // =========================

    let branch = await Branch.findOne({
      name: "Trimly Test Salon",
      ownerId: owner._id,
      deletedAt: null,
    });

    if (!branch) {
      branch = await Branch.create({
        ownerId: owner._id,
        name: "Trimly Test Salon",
        address: "Block 13-D, Gulshan-e-Iqbal",
        area: "Gulshan-e-Iqbal",
        city: "Karachi",
        isOpen: true,
        avgRating: 4.8,
        ratingCount: 120,
        deletedAt: null,
      });

      console.log("✅ Test salon created");
    } else {
      console.log("ℹ️ Test salon already exists");
    }

    // =========================
    // CATEGORY 1
    // =========================

    let hairCategory = await Category.findOne({
      branchId: branch._id,
      name: "Hair Services",
      deletedAt: null,
    });

    if (!hairCategory) {
      hairCategory = await Category.create({
        branchId: branch._id,
        name: "Hair Services",
        description: "Hair cutting and styling services",
        isActive: true,
        deletedAt: null,
      });

      console.log("✅ Hair category created");
    }

    // =========================
    // CATEGORY 2
    // =========================

    let beardCategory = await Category.findOne({
      branchId: branch._id,
      name: "Beard Services",
      deletedAt: null,
    });

    if (!beardCategory) {
      beardCategory = await Category.create({
        branchId: branch._id,
        name: "Beard Services",
        description: "Beard grooming services",
        isActive: true,
        deletedAt: null,
      });

      console.log("✅ Beard category created");
    }

    // =========================
    // SERVICES
    // =========================

    const services = [
      {
        branchId: branch._id,
        categoryId: hairCategory._id,
        name: "Classic Haircut",
        description: "Professional classic haircut",
        price: 800,
        durationMinutes: 30,
        isActive: true,
        deletedAt: null,
      },

      {
        branchId: branch._id,
        categoryId: hairCategory._id,
        name: "Hair Styling",
        description: "Professional hair styling",
        price: 1000,
        durationMinutes: 40,
        isActive: true,
        deletedAt: null,
      },

      {
        branchId: branch._id,
        categoryId: hairCategory._id,
        name: "Haircut and Beard",
        description: "Haircut with beard trimming",
        price: 1200,
        durationMinutes: 45,
        isActive: true,
        deletedAt: null,
      },

      {
        branchId: branch._id,
        categoryId: beardCategory._id,
        name: "Beard Trim",
        description: "Professional beard trimming",
        price: 500,
        durationMinutes: 20,
        isActive: true,
        deletedAt: null,
      },
    ];

    for (const serviceData of services) {
      const existingService = await Service.findOne({
        branchId: branch._id,
        name: serviceData.name,
        deletedAt: null,
      });

      if (!existingService) {
        await Service.create(serviceData);

        console.log(
          `✅ Service created: ${serviceData.name}`,
        );
      } else {
        console.log(
          `ℹ️ Service already exists: ${serviceData.name}`,
        );
      }
    }

    // =========================
    // BARBER USER
    // =========================

    let barber = await User.findOne({
      email: "testbarber@trimly.com",
    });

    if (!barber) {
      const hashedPassword = await bcrypt.hash(
        "Test@123",
        10,
      );

      barber = await User.create({
        name: "Ali Barber",
        email: "testbarber@trimly.com",
        phone: "03001234569",
        password: hashedPassword,
        roles: ["BARBER"],
        isVerified: true,
        deletedAt: null,
      });

      console.log("✅ Test barber user created");
    } else {
      console.log("ℹ️ Test barber already exists");
    }

    // =========================
    // BARBER PROFILE
    // =========================

    let barberProfile = await BarberProfile.findOne({
      userId: barber._id,
      deletedAt: null,
    });

    if (!barberProfile) {
      barberProfile = await BarberProfile.create({
        userId: barber._id,
        branchId: branch._id,
        bio: "Professional barber with modern styling experience",
        specialties: [
          "Haircut",
          "Beard Trim",
          "Hair Styling",
        ],
        isAvailable: true,
        avgRating: 4.7,
        ratingCount: 45,
        deletedAt: null,
      });

      console.log("✅ Barber profile created");
    } else {
      console.log("ℹ️ Barber profile already exists");
    }

    // =========================
    // BARBER SCHEDULE
    // =========================

    const schedule = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    for (const day of schedule) {
      const existingSchedule =
        await BarberSchedule.findOne({
          barberProfileId: barberProfile._id,
          dayOfWeek: day,
          deletedAt: null,
        });

      if (!existingSchedule) {
        await BarberSchedule.create({
          barberProfileId: barberProfile._id,
          dayOfWeek: day,
          startTime: "10:00",
          endTime: "20:00",
          breakStart: "14:00",
          breakEnd: "15:00",
          isWorkingDay: true,
          deletedAt: null,
        });

        console.log(
          `✅ Barber schedule created: ${day}`,
        );
      }
    }

    // =========================
    // RESULT
    // =========================

    console.log("");
    console.log("=================================");
    console.log("🎉 TRIMLY TEST DATA READY");
    console.log("=================================");
    console.log("");

    console.log("Owner ID:");
    console.log(owner._id.toString());

    console.log("");

    console.log("Customer ID:");
    console.log(customer._id.toString());

    console.log("");

    console.log("Branch ID:");
    console.log(branch._id.toString());

    console.log("");

    console.log("Hair Category ID:");
    console.log(hairCategory._id.toString());

    console.log("");

    console.log("Beard Category ID:");
    console.log(beardCategory._id.toString());

    console.log("");

    console.log("Barber User ID:");
    console.log(barber._id.toString());

    console.log("");

    console.log("Barber Profile ID:");
    console.log(barberProfile._id.toString());

    console.log("");

    console.log("Test Login:");
    console.log("Email: testcustomer@trimly.com");
    console.log("Password: Test@123");

    console.log("");
    console.log("=================================");

  } catch (error) {
    console.error("");
    console.error("❌ SEEDING FAILED");
    console.error(error);
  } finally {
    await mongoose.connection.close();

    console.log("");
    console.log("🔌 MongoDB connection closed");

    process.exit();
  }
};

seedTestData();