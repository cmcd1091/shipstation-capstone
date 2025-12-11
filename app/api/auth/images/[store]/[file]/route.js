import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(request, { params }) {
  try {
    // --- AUTH ---
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { file } = params;

    // ---------------------------
    // Extract base SKU correctly
    // Example: CN-607N-L-CN-3836.png
    // parts = ["CN", "607N", "L", "CN", "3836.png"]
    // baseSku = "CN-607N.png"
    // ---------------------------
    const parts = file.split("-");
    const baseSku = `${parts[0]}-${parts[1]}.png`;

    // Build absolute path
    const imagePath = path.join(
      process.cwd(),
      "public",
      "sourcePNGs",
      baseSku
    );

    console.log("📁 Looking for image:", imagePath);

    // Check file exists
    if (!fs.existsSync(imagePath)) {
      console.error(`❌ PNG not found: ${imagePath}`);
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Read file
    const buffer = fs.readFileSync(imagePath);

    // Return image
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
