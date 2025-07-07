const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());

const targetBaseFolder = '/Users/cmm1158/Desktop/FilesToPrint';
app.use('/images', express.static(targetBaseFolder));

const SHIPSTATION_API_KEY = '2d67b318fa06467d94c9c159aa987f5d';
const SHIPSTATION_API_SECRET = '14ccebfdb07748748663e66fa98c3a28';

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
      continue;
    }
    for (const item of order.items) {
      for (let i = 1; i <= item.quantity; i++) {
        const copied = copyPng(item.sku, order.orderNumber, store, i);
        if (copied) {
          copiedFiles.push(copied);
        }
      }
    }
  }

  return { copiedFiles, skippedOrders };
};

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

    res.json({ message, files: copiedFiles, skippedOrders});
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching transfers');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

const copyPng = (sku, orderNumber, store, copyIndex = 1) => {
  const suffix = copyIndex > 1 ? `-${copyIndex}` : '';
  const pngCopyName = `${sku}-${orderNumber}${suffix}.png`;
  const sourceFolder = path.join(__dirname, 'sourcePNGs');
  const targetStoreFolder = path.join(targetBaseFolder, store);
  const sourcePngPath = path.join(sourceFolder, `${sku}.png`);
  const targetPngPath = path.join(targetStoreFolder, pngCopyName);

  if (!fs.existsSync(sourcePngPath)) {
    console.error(`PNG not found: ${sourcePngPath}`);
    return null;
  }

  if (!fs.existsSync(targetStoreFolder)) {
    fs.mkdirSync(targetStoreFolder, { recursive: true });
    console.log(`Created target folder: ${targetStoreFolder}`);
  }

  fs.copyFileSync(sourcePngPath, targetPngPath);

  return pngCopyName;
};
