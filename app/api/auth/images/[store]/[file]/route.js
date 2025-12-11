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

    const { store, file } = params;

    // Path to your bundled assets inside the Next.js project
    const imagePath = path.join(process.cwd(), "public", "sourcePNGs", file);

    // Ensure the file exists
    if (!fs.existsSync(imagePath)) {
      console.error("Image not found:", imagePath);
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const imageBuffer = fs.readFileSync(imagePath);

    const ext = path.extname(file).toLowerCase();
    const mime =
      ext === ".png" ? "image/png" :
      ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
      "application/octet-stream";

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000",
      }
    });

  } catch (err) {
    console.error("Image route error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
