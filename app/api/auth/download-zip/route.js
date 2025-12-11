import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import fs from "fs";
import path from "path";
import archiver from "archiver";

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const store = searchParams.get("store");

    if (!store) {
      return NextResponse.json({ error: "Missing store" }, { status: 400 });
    }

    const folderPath = path.join(process.cwd(), "FilesToPrint", store);

    if (!fs.existsSync(folderPath)) {
      return NextResponse.json(
        { error: "No folder found for this store" },
        { status: 404 }
      );
    }

    // Create the archive
    const archive = archiver("zip", { zlib: { level: 9 } });

    // Stream output to memory
    const chunks = [];
    archive.on("data", (chunk) => chunks.push(chunk));

    await new Promise((resolve, reject) => {
      archive.directory(folderPath, false);
      archive.finalize();
      archive.on("end", resolve);
      archive.on("error", reject);
    });

    const zipBuffer = Buffer.concat(chunks);

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${store}-transfers.zip"`,
      },
    });
  } catch (err) {
    console.error("ZIP download error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
