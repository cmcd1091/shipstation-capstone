// server.cjs
const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const archiver = require("archiver");
require("dotenv").config();

const app = express();

// ---------- MIDDLEWARE ----------
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());

// ---------- STATIC ----------
const FILES_BASE = path.join(__dirname, "FilesToPrint");
const SOURCE_PNGS = path.join(__dirname, "sourcePNGs");
app.use("/files", express.static(FILES_BASE));

// ---------- ENV VARS ----------
const {
  SHIPSTATION_API_KEY,
  SHIPSTATION_API_SECRET,
  MONGODB_URI,
  JWT_SECRET,
} = process.env;

// ---------- MONGOOSE ----------
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const transferSchema = new mongoose.Schema(
  {
    store: String,
    orderNumber: String,
    sku: String,
    baseSku: String,
    quantityIndex: Number,
    fileName: String,
    skipped: Boolean,
  },
  { timestamps: true }
);

const Transfer = mongoose.model("Transfer", transferSchema);

// ---------- AUTH ----------
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// ---------- HELPER: COPY PNG ----------
const copyPng = (sku, orderNumber, store, index) => {
  if (!sku || sku === "N/A") return null;

  const cleanSku = String(sku).trim();
  const baseSku = cleanSku.slice(0, 6);
  const suffix = index > 1 ? `-${index}` : "";
  const fileName = `${cleanSku}-${orderNumber}${suffix}.png`;

  const sourcePath = path.join(SOURCE_PNGS, `${baseSku}.png`);
  const targetFolder = path.join(FILES_BASE, store);
  const targetPath = path.join(targetFolder, fileName);

  if (!fs.existsSync(sourcePath)) {
    console.log(
      `PNG not found for base SKU "${baseSku}" at ${sourcePath}`
    );
    return null;
  }

  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
    console.log(`Created folder: ${targetFolder}`);
  }

  fs.copyFileSync(sourcePath, targetPath);
  return { baseSku, fileName };
};

// ---------- FETCH SHIPSTATION ORDERS ----------
const fetchTransfers = async (storeId, store, pageSize) => {
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
  const skipped = [];

  const PRINTED_TAG = 111476;

  for (const order of orders) {
    const isPrinted = order.tagIds?.includes(PRINTED_TAG);

    if (isPrinted) {
      skipped.push(order.orderNumber);
      await Transfer.create({
        store,
        orderNumber: order.orderNumber,
        sku: "N/A",
        baseSku: "N/A",
        quantityIndex: 0,
        fileName: "",
        skipped: true,
      });
      continue;
    }

    for (const item of order.items) {
      for (let i = 1; i <= item.quantity; i++) {
        const result = copyPng(item.sku, order.orderNumber, store, i);
        if (result) {
          copiedFiles.push(result.fileName);
          await Transfer.create({
            store,
            orderNumber: order.orderNumber,
            sku: item.sku,
            baseSku: result.baseSku,
            quantityIndex: i,
            fileName: result.fileName,
            skipped: false,
          });
        }
      }
    }
  }

  return { copiedFiles, skipped };
};

// ---------- ROUTE: FETCH TRANSFERS ----------
app.get("/fetch-transfers", async (req, res) => {
  try {
    const store = req.query.store;
    const pageSize = parseInt(req.query.pageSize, 10) || 5;

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
      tony: 498451,
    };

    const storeId = storeMap[store];
    if (!storeId) return res.status(400).json({ error: "Invalid store" });

    const { copiedFiles, skipped } = await fetchTransfers(
      storeId,
      store,
      pageSize
    );

    res.json({
      message: `${copiedFiles.length} files copied`,
      files: copiedFiles,
      skippedOrders: skipped,
      downloadUrl: `/download/${store}.zip`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching transfers" });
  }
});

// ---------- ZIP DOWNLOAD ROUTE ----------
app.get("/download/:store.zip", (req, res) => {
  const store = req.params.store;
  const folder = path.join(FILES_BASE, store);

  if (!fs.existsSync(folder)) {
    return res.status(404).send("No files found");
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${store}.zip"`
  );

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(res);
  archive.directory(folder, false);
  archive.finalize();
});

// ---------- SPA FALLBACK ----------
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (_, res) => res.sendFile(path.join(distPath, "index.html")));

// ---------- START ----------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
