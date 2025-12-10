const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// ---------- MIDDLEWARE ----------
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json()); // for JSON bodies

// ---------- STATIC FILES ----------
const targetBaseFolder = '/Users/cmm1158/Desktop/FilesToPrint';
app.use('/images', express.static(targetBaseFolder));

// ---------- ENV VARS ----------
const SHIPSTATION_API_KEY = process.env.SHIPSTATION_API_KEY;
const SHIPSTATION_API_SECRET = process.env.SHIPSTATION_API_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

console.log('KEY present?', !!SHIPSTATION_API_KEY, 'SECRET present?', !!SHIPSTATION_API_SECRET);
console.log('MONGODB_URI present?', !!MONGODB_URI);
console.log('JWT_SECRET present?', !!JWT_SECRET);

// ---------- MONGOOSE SETUP ----------
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB');
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
} else {
  console.warn('⚠️ No MONGODB_URI set; MongoDB features disabled.');
}

// ---------- SCHEMAS / MODELS ----------
const transferSchema = new mongoose.Schema(
  {
    store: { type: String, required: true },
    orderNumber: { type: String, required: true },
    sku: { type: String, required: true },
    baseSku: { type: String, required: true },
    quantityIndex: { type: Number, default: 1 },
    fileName: { type: String, required: true },
    skipped: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Transfer = mongoose.model('Transfer', transferSchema);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

// ---------- AUTH MIDDLEWARE ----------
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    console.error('JWT verify error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ---------- AUTH ROUTES ----------
// Register: used once to create an initial user (use curl/Postman)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });

    res.status(201).json({ id: user._id, email: user.email });
  } catch (err) {
    console.error('Error registering user:', err.message);
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Login: returns JWT
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, email: user.email });
  } catch (err) {
    console.error('Error logging in:', err.message);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// ---------- CORE LOGIC: FETCH TRANSFERS FROM SHIPSTATION ----------
const fetchTransfers = async (storeId, store, pageSize) => {
  const auth = Buffer.from(`${SHIPSTATION_API_KEY}:${SHIPSTATION_API_SECRET}`).toString('base64');

  const response = await axios.get('https://ssapi.shipstation.com/orders', {
    headers: {
      Authorization: `Basic ${auth}`,
    },
    params: {
      orderStatus: 'awaiting_shipment',
      storeid: storeId,
      pageSize,
    },
  });

  const orders = response.data.orders;
  const copiedFiles = [];
  const skippedOrders = [];
  const PRINTED_TAG = 111476;

  for (const order of orders) {
    if (order.tagIds && order.tagIds.includes(PRINTED_TAG)) {
      skippedOrders.push(order.orderNumber);

      // record skipped order as a document (optional but nice)
      await Transfer.create({
        store,
        orderNumber: order.orderNumber,
        sku: 'N/A',
        baseSku: 'N/A',
        quantityIndex: 0,
        fileName: '',
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

// ---------- ROUTE: FETCH & COPY TRANSFERS (still public for now) ----------
app.get('/fetch-transfers', async (req, res) => {
  try {
    const store = req.query.store;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize, 10) : 5;

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

    if (!storeId) {
      return res.status(400).json({ error: 'Invalid or missing store parameter' });
    }

    const { copiedFiles, skippedOrders } = await fetchTransfers(storeId, store, pageSize);

    let message = '';
    if (copiedFiles.length > 0) {
      message += ` ${copiedFiles.length} files copied successfully`;
    } else {
      message += ` No files were copied.`;
    }

    res.json({ message, files: copiedFiles, skippedOrders });
  } catch (error) {
    console.error('Error fetching transfers from ShipStation:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);

    res
      .status(500)
      .send(error.response?.data || error.message || 'Error fetching transfers');
  }
});

// ---------- PROTECTED CRUD ROUTES FOR TRANSFERS ----------
app.post('/api/transfers', authMiddleware, async (req, res) => {
  try {
    const transfer = await Transfer.create(req.body);
    res.status(201).json(transfer);
  } catch (err) {
    console.error('Error creating transfer:', err.message);
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/transfers', authMiddleware, async (req, res) => {
  try {
    const filters = {};
    if (req.query.store) filters.store = req.query.store;
    if (req.query.skipped) filters.skipped = req.query.skipped === 'true';

    const transfers = await Transfer.find(filters)
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(transfers);
  } catch (err) {
    console.error('Error fetching transfers from DB:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/transfers/:id', authMiddleware, async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }
    res.json(transfer);
  } catch (err) {
    console.error('Error fetching transfer:', err.message);
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/transfers/:id', authMiddleware, async (req, res) => {
  try {
    const transfer = await Transfer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }
    res.json(transfer);
  } catch (err) {
    console.error('Error updating transfer:', err.message);
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/transfers/:id', authMiddleware, async (req, res) => {
  try {
    const transfer = await Transfer.findByIdAndDelete(req.params.id);
    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }
    res.json({ message: 'Transfer deleted' });
  } catch (err) {
    console.error('Error deleting transfer:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ---------- SERVER START ----------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


// ---------- FILE COPY HELPER ----------
const copyPng = (sku, orderNumber, store, copyIndex = 1) => {
  const cleanSku = String(sku).trim();

  const baseSku = cleanSku.slice(0, 6);

  const suffix = copyIndex > 1 ? `-${copyIndex}` : '';
  const pngCopyName = `${cleanSku}-${orderNumber}${suffix}.png`;

  const sourceFolder = path.join(__dirname, 'sourcePNGs');
  const targetStoreFolder = path.join(targetBaseFolder, store);

  const sourcePngPath = path.join(sourceFolder, `${baseSku}.png`);
  const targetPngPath = path.join(targetStoreFolder, pngCopyName);

  if (!fs.existsSync(sourcePngPath)) {
    console.error(
      `PNG not found for base SKU "${baseSku}" (full sku "${cleanSku}"): ${sourcePngPath}`
    );
    return null;
  }

  if (!fs.existsSync(targetStoreFolder)) {
    fs.mkdirSync(targetStoreFolder, { recursive: true });
    console.log(`Created target folder: ${targetStoreFolder}`);
  }

  fs.copyFileSync(sourcePngPath, targetPngPath);

  return { pngCopyName, baseSku };
};
