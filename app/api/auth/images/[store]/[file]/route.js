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

    // EXTRACT BASE SKU CORRECTLY
    // Example: CN-607N-L-CN-3836.png → CN-607.png
    const parts = file.split("-");
    const rawSku = parts[1];          // e.g. "607N" or "637HG"
    const digits = rawSku.replace(/\D/g, "").slice(0, 3); // "607", "637"
    const baseSku = `${parts[0]}-${digits}.png`;          // CN-607.png

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
