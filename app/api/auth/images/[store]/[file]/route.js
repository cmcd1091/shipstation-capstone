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

    const { store, file } = params;

    // --- Extract base SKU from ShipStation filenames ---
    // Example: "CN-613HG-M-CN-3827.png" → "CN-613.png"
    const baseSku = file.split(/[-_]/)[0] + ".png";

    // Build absolute path to public/sourcePNGs
    const imagePath = path.join(
      process.cwd(),
      "public",
      "sourcePNGs",
      baseSku
    );

    if (!fs.existsSync(imagePath)) {
      console.error(`❌ PNG not found for base SKU "${baseSku}" at ${imagePath}`);
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
