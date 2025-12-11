import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { auth } from "../../auth"; // adjust if your auth path differs

// Extract base SKU from filenames like:
// CN-506N-M-CN-3828.png → CN-506
// CN-613HG-M-CN-3827.png → CN-613HG
// CN-504N-XL-CN-3834.png → CN-504N
function extractBaseSKU(filename) {
  if (!filename) return null;

  // Remove extension
  const name = filename.replace(".png", "");

  // Split into parts
  const parts = name.split("-");

  // At minimum we expect ["CN", "506N", ...]
  if (parts.length < 2) return null;

  // Base SKU is ALWAYS first two hyphen groups
  // CN-506N → CN-506N
  return `${parts[0]}-${parts[1]}`;
}

export async function GET(request, { params }) {
  // --- AUTH ---
  const session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { store, file } = params;

  // Safety checks
  if (!store || !file) {
    return new NextResponse("Missing store or file parameter", { status: 400 });
  }

  // Extract proper SKU
  const baseSKU = extractBaseSKU(file);

  if (!baseSKU) {
    console.error("Could not extract SKU from", file);
    return new NextResponse("Invalid filename format", { status: 400 });
  }

  // Build absolute path to PNG
  const filePath = path.join(
    process.cwd(),
    "sourcePNGs",
    `${baseSKU}.png`
  );

  // Check file exists
  if (!fs.existsSync(filePath)) {
    console.error(`PNG not found for ${baseSKU} at ${filePath}`);
    return new NextResponse("Image not found", { status: 404 });
  }

  // Read file
  const imageBuffer = fs.readFileSync(filePath);

  return new NextResponse(imageBuffer, {
    status: 200,
    headers: {
      "Content-Type": "image/png"
    }
  });
}
