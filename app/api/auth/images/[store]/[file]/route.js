import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(request, { params }) {
  try {
    // --- AUTH FIX: accept ?token= in URL ---
    const { searchParams } = new URL(request.url);
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      searchParams.get("token");

    const user = token
      ? getUserFromRequest({ headers: { authorization: `Bearer ${token}` } })
      : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { file } = params;

    // Extract base SKU
    const parts = file.split("-");
    const rawSku = parts[1]; // "607N", "637HG", etc.
    const digits = rawSku.replace(/\D/g, "").slice(0, 3);
    const baseSku = `${parts[0]}-${digits}.png`;

    const imagePath = path.join(process.cwd(), "public", "sourcePNGs", baseSku);

    console.log("🧩 file:", file);
    console.log("🧩 computed baseSku:", baseSku);
    console.log("🧩 checking path:", imagePath);

    if (!fs.existsSync(imagePath)) {
      console.error(`❌ PNG not found: ${imagePath}`);
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const buffer = fs.readFileSync(imagePath);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000",
      },
    });

  } catch (err) {
    console.error("Image route error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
