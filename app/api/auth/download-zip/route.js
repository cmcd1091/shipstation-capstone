export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import JSZip from "jszip";
import fs from "fs";
import path from "path";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request) {
  try {
    // ===============================
    // AUTH
    // ===============================
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ===============================
    // PARAMS
    // ===============================
    const { searchParams } = new URL(request.url);

    const store = searchParams.get("store");
    let files = searchParams.getAll("file");

    if (!store) {
      return NextResponse.json(
        { error: "Missing store" },
        { status: 400 }
      );
    }

    /**
     * If no files are passed, derive them internally
     * (prevents 400s when clicking the ZIP button)
     */
    if (!files.length) {
      const sourceDir = path.join(
        process.cwd(),
        "public",
        "sourcePNGs"
      );

      files = fs
        .readdirSync(sourceDir)
        .filter((f) => f.startsWith(store));
    }

    if (!files.length) {
      return NextResponse.json(
        { error: "No files found for store" },
        { status: 404 }
      );
    }

    // ===============================
    // ZIP BUILD
    // ===============================
    const zip = new JSZip();
    const skipped = [];

    for (const file of files) {
      // Compute base SKU from file name
      const parts = file.split("-");
      const rawSku = parts[1] || "";
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
      } else {
        skipped.push(file);
      }
    }

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
    });

    // ===============================
    // RESPONSE
    // ===============================
    const response = new Response(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${store}-images.zip"`,
      },
    });

    /**
     * Expose skipped files so the UI can read them
     */
    if (skipped.length) {
      response.headers.set(
        "X-Skipped-Files",
        JSON.stringify(skipped)
      );
    }

    return response;

  } catch (err) {
    console.error("ZIP route error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
