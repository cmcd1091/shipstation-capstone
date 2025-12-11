import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Transfer from "@/models/Transfer";

export async function GET(request) {
  try {
    // --- AUTH CHECK ---
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- DB CONNECTION ---
    await connectDB();

    // --- QUERY TRANSFERS ---
    const transfers = await Transfer.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, transfers });
  } catch (err) {
    console.error("Error fetching transfers:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch transfers",
        error: err.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // --- AUTH CHECK ---
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- DB CONNECTION ---
    await connectDB();

    // --- BODY ---
    const body = await request.json();

    // Create new transfer
    const newTransfer = await Transfer.create(body);

    return NextResponse.json({ success: true, transfer: newTransfer });
  } catch (err) {
    console.error("Error saving transfer:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save transfer",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
