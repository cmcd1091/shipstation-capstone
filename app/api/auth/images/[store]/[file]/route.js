import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

export async function GET(request, { params }) {
  try {
    // --------------------------
    // ACCEPT TOKEN FROM QUERY
    // --------------------------
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    let user = null;

    if (token) {
      try {
        user = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        console.error("❌ Invalid token:", err.message);
      }
    } else {
      // fallback to standard header auth
      user = getUserFromRequest(request);
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --------------------------
    // Extract filename & SKU
    // --------------------------
    const { file } = params;

    const parts = file.split("-");
    const rawSku = parts[1];
    const digits = rawSku.replace(/\D/g, "").slice(0, 3);
    const baseSku = `${parts[0]}-${digits}.png`;

    const imagePath = path.join(
      process.cwd(),
      "public",
      "sourcePNGs",
      baseSku
    );

    console.log("🖼 FILE:", file);
    console.log("🖼 Base SKU:", baseSku);
    console.log("🖼 Path:", imagePath);

    if (!fs.existsSync(imagePath)) {
      console.error("❌ Image missing:", imagePath);
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
