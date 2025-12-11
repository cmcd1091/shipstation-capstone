import { NextResponse } from "next/server";
import axios from "axios";
import fs from "fs";
import path from "path";
import { connectDB } from "@/lib/db";
import Transfer from "@/models/Transfer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SHIPSTATION_API_KEY = process.env.SHIPSTATION_API_KEY;
const SHIPSTATION_API_SECRET = process.env.SHIPSTATION_API_SECRET;

// root of project (same on Render and local)
const ROOT_DIR = process.cwd();
const SOURCE_PNG_FOLDER = path.join(ROOT_DIR, "public", "sourcePNGs");
const TARGET_BASE_FOLDER = path.join(ROOT_DIR, "FilesToPrint");

// helper to copy a single PNG file
function copyPng(sku, orderNumber, store, copyIndex = 1) {
  const cleanSku = String(sku).trim();

  const baseSku = cleanSku.slice(0, 6);
  const suffix = copyIndex > 1 ? `-${copyIndex}` : "";
  const pngCopyName = `${cleanSku}-${orderNumber}${suffix}.png`;

  const sourcePngPath = path.join(SOURCE_PNG_FOLDER, `${baseSku}.png`);
  const targetStoreFolder = path.join(TARGET_BASE_FOLDER, store);
  const targetPngPath = path.join(targetStoreFolder, pngCopyName);

  if (!fs.existsSync(sourcePngPath)) {
    console.error(
      `PNG not found for base SKU "${baseSku}" at ${sourcePngPath}`
    );
    return null;
  }

  if (!fs.existsSync(targetStoreFolder)) {
    fs.mkdirSync(targetStoreFolder, { recursive: true });
    console.log(`Created folder: ${targetStoreFolder}`);
  }

  fs.copyFileSync(sourcePngPath, targetPngPath);

  return { pngCopyName, baseSku };
}

async function fetchTransfersFromShipStation(storeId, store, pageSize) {
  const auth = Buffer.from(
    `${SHIPSTATION_API_KEY}:${SHIPSTATION_API_SECRET}`
  ).toString("base64");

  const response = await axios.get("https://ssapi.shipstation.com/orders", {
    headers: {
      Authorization: `Basic ${auth}`
    },
    params: {
      orderStatus: "awaiting_shipment",
      storeid: storeId,
      pageSize
    }
  });

  const orders = response.data.orders || [];
  const copiedFiles = [];
  const skippedOrders = [];
  const PRINTED_TAG = 111476;

  for (const order of orders) {
    if (order.tagIds && order.tagIds.includes(PRINTED_TAG)) {
      skippedOrders.push(order.orderNumber);

      await Transfer.create({
        store,
        orderNumber: order.orderNumber,
        sku: "N/A",
        baseSku: "N/A",
        quantityIndex: 0,
        fileName: "",
        skipped: true
      });

      continue;
    }

    for (const item of order.items || []) {
      for (let i = 1; i <= item.quantity; i++) {
        const result = copyPng(item.sku, order.orderNumber, store, i);
        if (result) {
          const { pngCopyName, baseSku } = result;

          copiedFiles.push(pngCopyName);

          await Transfer.create({
            store,
            orderNumber: order.orderNumber,
            sku: item.sku,
            baseSku,
            quantityIndex: i,
            fileName: pngCopyName,
            skipped: false
          });
        }
      }
    }
  }

  return { copiedFiles, skippedOrders };
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const store = searchParams.get("store");
    const pageSize = searchParams.get("pageSize")
      ? parseInt(searchParams.get("pageSize"), 10)
      : 5;

    const storeMap = {
      alcolo: 516232,
      coed: 521077,
      duke: 506068,
      dukeTT: 519357,
      eighties: 503161,
      jakey: 519376,
      mo: 521880,
      michaels: 313127,
      slick: 514521,
      tony: 498451
    };

    const storeId = storeMap[store];

    if (!storeId) {
      return NextResponse.json(
        { error: "Invalid or missing store parameter" },
        { status: 400 }
      );
    }

    const { copiedFiles, skippedOrders } = await fetchTransfersFromShipStation(
      storeId,
      store,
      pageSize
    );

    let message = "";
    if (copiedFiles.length > 0) {
      message = `${copiedFiles.length} files copied successfully`;
    } else {
      message = `No files were copied.`;
    }

    return NextResponse.json({ message, files: copiedFiles, skippedOrders });
  } catch (error) {
    console.error("Error fetching transfers from ShipStation:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    return NextResponse.json(
      {
        error:
          error.response?.data ||
          error.message ||
          "Error fetching transfers from ShipStation"
      },
      { status: 500 }
    );
  }
}
