// server.cjs
const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ---------- NEXT.JS ----------
const next = require("next");
const nextApp = next({
  dev: false,          // Render = production
  dir: "./"            // Next.js project root
});
const handle = nextApp.getRequestHandler();

// ---------- EXPRESS ----------
const app = express();

// ---------- MIDDLEWARE ----------
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

// ---------- STATIC FILES (PNG output folder) ----------
// LOCAL-ONLY path — this will NOT exist on Render
const targetBaseFolder = "/Users/cmm1158/Desktop/FilesToPrint";

// This only works locally. On Render it won’t break anything.
if (fs.existsSync(targetBaseFolder)) {
  app.use("/images", express.static(targetBaseFolder));
}

// ---------- ENV VARS ----------
const {
  SHIPSTATION_API_KEY,
  SHIPSTATION_API_SECRET,
  MONGODB_URI,
  JWT_SECRET,
} = process.env;

console.log("KEY present?", !!SHIPSTATION_API_KEY, "SECRET present?", !!SHIPSTATION_API_SECRET);
console.log("MONGODB_URI present?", !!MONGODB_URI);
console.log("JWT_SECRET present?", !!JWT_SECRET);

// ---------- MONGOOSE ----------
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB error:", err.message));
} else {
  console.warn("⚠️ No MONGODB_URI provided");
}

// ---------- SCHEMAS ----------
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

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: String,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// ---------- AUTH MIDDLEWARE ----------
const authMiddleware = (req, res, next) => {
  const token =
    req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;

  if (!token) return res.status(401).json({ error: "No token" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// ---------- AUTH ROUTES ----------
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });

    res.status(201).json({ id: user._id, email });
  } catch (err) {
    res.status(500).json({ error: "Registration error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id.toString(), email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, email });
  } catch (err) {
    res.status(500).json({ error: "Login error" });
  }
});

// ---------- FILE COPY HELPER ----------
const copyPng = (sku, orderNumber, store, copyIndex = 1) => {
  const cleanSku = String(sku).trim();
  const baseSku = cleanSku.slice(0, 6);

  const suffix = copyIndex > 1 ? `-${copyIndex}` : "";
  const pngCopyName = `${cleanSku}-${orderNumber}${suffix}.png`;

  const sourceFolder = path.join(__dirname, "sourcePNGs");
  const targetStoreFolder = path.join(targetBaseFolder, store);

  const sourcePngPath = path.join(sourceFolder, `${baseSku}.png`);
  const targetPngPath = path.join(targetStoreFolder, pngCopyName);

  if (!fs.existsSync(sourcePngPath)) {
    console.error("PNG not found:", baseSku);
    return null;
  }

  if (!fs.existsSync(targetStoreFolder)) {
    try {
      fs.mkdirSync(targetStoreFolder, { recursive: true });
      console.log("Created:", targetStoreFolder);
    } catch (err) {
      console.error("Cannot mkdir:", targetStoreFolder);
      return null;
    }
  }

  try {
    fs.copyFileSync(sourcePngPath, targetPngPath);
  } catch (err) {
    console.error("Copy error:", err.message);
    return null;
  }

  return { pngCopyName, baseSku };
};

// ---------- SHIPSTATION FETCH ----------
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

  const orders = response.data.orders;
  const copiedFiles = [];
  const skippedOrders = [];

  const PRINTED_TAG = 111476;

  for (const order of orders) {
    if (order.tagIds?.includes(PRINTED_TAG)) {
      skippedOrders.push(order.orderNumber);
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
          const { pngCopyName, baseSku } = result;
          copiedFiles.push(pngCopyName);

          await Transfer.create({
            store,
            orderNumber: order.orderNumber,
            sku: item.sku,
            baseSku,
            quantityIndex: i,
            fileName: pngCopyName,
            skipped: false,
          });
        }
      }
    }
  }

  return { copiedFiles, skippedOrders };
};

// ---------- FETCH TRANSFERS ROUTE ----------
app.get("/fetch-transfers", async (req, res) => {
  try {
    const { store, pageSize = 5 } = req.query;

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

    const result = await fetchTransfers(storeId, store, Number(pageSize));
    res.json(result);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: "Error fetching transfers" });
  }
});

// ---------- TRANSFERS CRUD ----------
app.get("/api/transfers", authMiddleware, async (req, res) => {
  try {
    const transfers = await Transfer.find({})
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(transfers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- NEXT.JS FALLBACK (ALL NON-API ROUTES) ----------
nextApp.prepare().then(() => {
  app.all("*", (req, res) => {
    return handle(req, res);
  });
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
