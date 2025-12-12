export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import JSZip from "jszip";
import fs from "fs";
import path from "path";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const files = searchParams.getAll("file");
    const store = searchParams.get("store");

    if (!files.length || !store) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    const zip = new JSZip();

    for (const file of files) {
      // Compute base SKU from file name
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

      if (fs.existsSync(imagePath)) {
        const buffer = fs.readFileSync(imagePath);
        zip.file(file, buffer);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${store}-images.zip"`,
      },
    });

  } catch (err) {
    console.error("ZIP route error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
