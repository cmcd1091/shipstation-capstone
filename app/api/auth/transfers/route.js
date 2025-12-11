import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transfer from "@/models/Transfer";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await connectDB();

    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = {};
    const store = searchParams.get("store");
    const skipped = searchParams.get("skipped");

    if (store) filters.store = store;
    if (skipped !== null) filters.skipped = skipped === "true";

    const transfers = await Transfer.find(filters)
      .sort({ createdAt: -1 })
      .limit(200);

    return NextResponse.json(transfers);
  } catch (err) {
    console.error("Error fetching transfers from DB:", err);
    return NextResponse.json(
      { error: "Error fetching transfers from DB" },
      { status: 500 }
    );
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
    const transfer = await Transfer.create(body);
    return NextResponse.json(transfer, { status: 201 });
  } catch (err) {
    console.error("Error creating transfer:", err);
    return NextResponse.json(
      { error: err.message || "Error creating transfer" },
      { status: 400 }
    );
  }
}
