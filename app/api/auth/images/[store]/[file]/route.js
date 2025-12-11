import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { file } = params;

    // Extract base SKU: CN-506HG-M-CN-3827.png → CN-506.png
    const match = file.match(/^[A-Za-z]+-\d+/);
    const baseSku = match ? match[0] + ".png" : file;

    const imagePath = path.join(process.cwd(), "public", "sourcePNGs", baseSku);

    console.log("🔎 Checking:", imagePath);

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
