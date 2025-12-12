import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import fs from "fs";
import path from "path";

function getBaseSku(filename) {
  const parts = filename.split("-");
  if (parts.length < 2) return null;

  const prefix = parts[0]; // CN or HOU
  const digits = parts[1].replace(/\D/g, "").slice(0, 4); // 3–4 digits

  if (!digits) return null;
  return `${prefix}-${digits}.png`;
}

export async function GET(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { file } = params;

    const baseSku = getBaseSku(file);
    if (!baseSku) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const imagePath = path.join(
      process.cwd(),
      "public",
      "sourcePNGs",
      baseSku
    );

    if (!fs.existsSync(imagePath)) {
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
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
