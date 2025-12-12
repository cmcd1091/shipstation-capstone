import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";  // make sure path is correct
import dotenv from "dotenv";

dotenv.config();

// -------------------------------
// CONFIG FROM ENV
// -------------------------------
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "test123";

async function run() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI is missing in environment!");
      process.exit(1);
    }

    console.log("⚙️ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("🔍 Checking if admin user exists...");
    let user = await User.findOne({ email: ADMIN_EMAIL });

    if (user) {
      console.log("✅ Admin user already exists. Skipping creation.");
      console.log("   Email:", ADMIN_EMAIL);
      process.exit(0);
    }

    console.log("🧂 Hashing password...");
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    console.log("🆕 Creating admin user...");
    user = await User.create({
      email: ADMIN_EMAIL,
      passwordHash: hash,
    });

    console.log("🎉 Admin user created successfully!");
    console.log("   Email:", ADMIN_EMAIL);
    console.log("   Password:", ADMIN_PASSWORD);
    process.exit(0);

  } catch (err) {
    console.error("❌ Error creating admin user:", err);
    process.exit(1);
  }
}

run();
