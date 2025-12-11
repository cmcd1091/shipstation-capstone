import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Transfer from "@/models/Transfer";

export async function GET(request) {
  try {
    await connectDB();

    // AUTH
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transfers = await Transfer.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json(transfers);
  } catch (err) {
    console.error("Error fetching transfers:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const created = await Transfer.create(body);

    return NextResponse.json(created);
  } catch (err) {
    console.error("Error saving transfer:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
