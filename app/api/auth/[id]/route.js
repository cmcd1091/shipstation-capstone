import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transfer from "@/models/Transfer";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  await connectDB();

  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const transfer = await Transfer.findById(params.id);
  if (!transfer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(transfer);
}
