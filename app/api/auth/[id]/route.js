import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transfer from "@/models/Transfer";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transfer = await Transfer.findById(params.id);
    if (!transfer) {
      return NextResponse.json(
        { error: "Transfer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transfer);
  } catch (err) {
    console.error("Error fetching transfer:", err);
    return NextResponse.json(
      { error: err.message || "Error fetching transfer" },
      { status: 400 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const transfer = await Transfer.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true
    });

    if (!transfer) {
      return NextResponse.json(
        { error: "Transfer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transfer);
  } catch (err) {
    console.error("Error updating transfer:", err);
    return NextResponse.json(
      { error: err.message || "Error updating transfer" },
      { status: 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transfer = await Transfer.findByIdAndDelete(params.id);
    if (!transfer) {
      return NextResponse.json(
        { error: "Transfer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Transfer deleted" });
  } catch (err) {
    console.error("Error deleting transfer:", err);
    return NextResponse.json(
      { error: err.message || "Error deleting transfer" },
      { status: 400 }
    );
  }
}
