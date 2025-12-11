import fs from "fs";
import path from "path";
import archiver from "archiver";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const store = searchParams.get("store");
    const token = searchParams.get("token");

    // Inject token into Authorization header so getUserFromRequest works
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }

    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!store) {
      return NextResponse.json({ error: "Missing store" }, { status: 400 });
    }

    const folderPath = path.join(process.cwd(), "FilesToPrint", store);

    if (!fs.existsSync(folderPath)) {
      return NextResponse.json({ error: "Store folder not found" }, { status: 404 });
    }

    // Create temporary ZIP file path
    const zipPath = path.join(process.cwd(), `temp-${store}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);
    archive.directory(folderPath, false);
    await archive.finalize();

    // Wait for file creation
    await new Promise((resolve) => output.on("close", resolve));

    // Read file into buffer
    const zipBuffer = fs.readFileSync(zipPath);

    // Delete temp ZIP after reading
    fs.unlinkSync(zipPath);

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${store}.zip"`,
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
