import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Transfer from "@/models/Transfer";

export async function GET() {
  try {
    // --- AUTH CHECK ---
    const session = await auth(request);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // --- DB CONNECTION ---
    await dbConnect();

    // --- QUERY TRANSFERS ---
    const transfers = await Transfer.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, transfers });
  } catch (err) {
    console.error("Error fetching transfers:", err);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Failed to fetch transfers",
        error: err.message,
      }),
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // --- AUTH ---
    const session = await auth(request);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // --- DB ---
    await dbConnect();

    // --- BODY ---
    const body = await request.json();

    // Insert into Mongo
    const newTransfer = await Transfer.create(body);

    return NextResponse.json({ success: true, transfer: newTransfer });
  } catch (err) {
    console.error("Error saving transfer:", err);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Failed to save transfer",
        error: err.message,
      }),
      { status: 500 }
    );
  }
}
