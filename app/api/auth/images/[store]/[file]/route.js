import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { store, file } = params;

    const ROOT_DIR = process.cwd();
    const filePath = path.join(ROOT_DIR, "FilesToPrint", store, file);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename="${file}"`
      }
    });
  } catch (err) {
    console.error("Error serving image:", err);
    return NextResponse.json(
      { error: "Error serving image" },
      { status: 500 }
    );
  }
}
