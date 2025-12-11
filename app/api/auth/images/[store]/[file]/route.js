import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request, { params }) {
  try {
    const { file } = params;

    const parts = file.split("-");
    const baseSku = `${parts[0]}-${parts[1]}.png`;

    const imagePath = path.join(
      process.cwd(),
      "public",
      "sourcePNGs",
      baseSku
    );

    console.log("🧩 file:", file);
    console.log("🧩 baseSku:", baseSku);
    console.log("🧩 path:", imagePath);

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
