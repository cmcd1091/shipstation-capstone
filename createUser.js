import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js"; // adjust path if needed
import dotenv from "dotenv";

dotenv.config();

async function run() {
  try {
    const email = "admin@example.com";
    const password = "test1234"; // CHANGE LATER if you want

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      passwordHash: hash,
    });

    console.log("User created:");
    console.log(user);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
