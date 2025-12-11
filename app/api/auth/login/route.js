import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();

    console.log("🔍 Incoming login:", email, password);
    console.log("🔍 Searching DB for user...");

    const user = await User.findOne({ email });
    
    console.log("🔍 User found:", user);

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    console.log("🔍 Password match:", ok);

    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({ token, email: user.email });
  } catch (err) {
    console.error("❌ Error logging in:", err);
    return NextResponse.json({ error: "Error logging in" }, { status: 500 });
  }
}
