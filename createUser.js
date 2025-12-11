import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  try {
    const email = "admin@example.com";
    const newPassword = "test123"; // <-- Your desired password

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    const hash = await bcrypt.hash(newPassword, 10);

    const updated = await User.findOneAndUpdate(
      { email },
      { passwordHash: hash },
      { new: true }
    );

    if (!updated) {
      console.log("❌ User not found — cannot update password");
    } else {
      console.log("✅ Password updated successfully:");
      console.log(updated);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
