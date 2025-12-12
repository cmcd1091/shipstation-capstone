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

const ROOT_DIR = process.cwd();
const SOURCE_PNG_FOLDER = path.join(ROOT_DIR, "public", "sourcePNGs");
const TARGET_BASE_FOLDER = path.join(ROOT_DIR, "FilesToPrint");

function getBaseSku(sku) {
  if (!sku) return null;
  const parts = sku.split("-");
  if (parts.length < 2) return null;

  const prefix = parts[0];
  const digits = parts[1].replace(/\D/g, "").slice(0, 4);

  if (!digits) return null;
  return `${prefix}-${digits}`;
}

function copyPng(sku, orderNumber, store, copyIndex = 1) {
  const baseSku = getBaseSku(sku);
  if (!baseSku) return null;

  const suffix = copyIndex > 1 ? `-${copyIndex}` : "";
  const pngCopyName = `${sku}-${orderNumber}${suffix}.png`;

  const sourcePngPath = path.join(SOURCE_PNG_FOLDER, `${baseSku}.png`);
  const targetStoreFolder = path.join(TARGET_BASE_FOLDER, store);
  const targetPngPath = path.join(targetStoreFolder, pngCopyName);

  if (!fs.existsSync(sourcePngPath)) return null;

  if (!fs.existsSync(targetStoreFolder)) {
    fs.mkdirSync(targetStoreFolder, { recursive: true });
  }

  fs.copyFileSync(sourcePngPath, targetPngPath);

  return pngCopyName;
}

async function fetchTransfersFromShipStation(storeId, store, pageSize) {
  const auth = Buffer.from(
    `${SHIPSTATION_API_KEY}:${SHIPSTATION_API_SECRET}`
  ).toString("base64");

  const response = await axios.get("https://ssapi.shipstation.com/orders", {
    headers: { Authorization: `Basic ${auth}` },
    params: {
      orderStatus: "awaiting_shipment",
      storeid: storeId,
      pageSize,
    },
  });

  const orders = response.data.orders || [];
  const copiedFiles = [];
  const skippedOrders = [];
  const PRINTED_TAG = 111476;

  for (const order of orders) {
    if (order.tagIds?.includes(PRINTED_TAG)) {
      skippedOrders.push(order.orderNumber);
      continue;
    }

    for (const item of order.items || []) {
      for (let i = 1; i <= item.quantity; i++) {
        const file = copyPng(item.sku, order.orderNumber, store, i);
        if (file) {
          copiedFiles.push(file);
          await Transfer.create({
            store,
            orderNumber: order.orderNumber,
            sku: item.sku,
            baseSku: getBaseSku(item.sku),
            quantityIndex: i,
            fileName: file,
            skipped: false,
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
    const pageSize = parseInt(searchParams.get("pageSize") || "5", 10);

    const storeMap = {
      coed: 521077,
      duke: 506068,
    };

    const storeId = storeMap[store];
    if (!storeId) {
      return NextResponse.json({ error: "Invalid store" }, { status: 400 });
    }

    const result = await fetchTransfersFromShipStation(
      storeId,
      store,
      pageSize
    );

    return NextResponse.json({
      message: result.copiedFiles.length
        ? `${result.copiedFiles.length} files copied`
        : "No files were copied",
      files: result.copiedFiles,
      skippedOrders: result.skippedOrders,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
