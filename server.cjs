const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());

const SHIPSTATION_API_KEY = '2d67b318fa06467d94c9c159aa987f5d';
const SHIPSTATION_API_SECRET = '14ccebfdb07748748663e66fa98c3a28';

const copyPng = (sku, orderNumber, store) => {
  const pngFileName = `${sku}-${orderNumber}.png`;
  const sourceFolder = path.join(__dirname, 'sourcePNGs');
  const targetBaseFolder = '/Users/cmm1158/Desktop/FilesToPrint';
  const storeFolder = path.join(targetBaseFolder, store);
  const sourcePngPath = path.join(sourceFolder, `${sku}.png`);
  const targetPngPath = path.join(storeFolder, pngFileName);

  if (!fs.existsSync(sourcePngPath)) {
    console.error(`PNG not found: ${sourcePngPath}`);
    return null;
  }

  if (!fs.existsSync(storeFolder)) {
    fs.mkdirSync(storeFolder, { recursive: true });
    console.log(`Created target folder: ${storeFolder}`);
  }

  fs.copyFileSync(sourcePngPath, targetPngPath);
  // console.log(`Copied: ${pngFileName}`);

  return pngFileName;
};

const fetchTransfers = async (storeId, store) => {
  const auth = Buffer.from(`${SHIPSTATION_API_KEY}:${SHIPSTATION_API_SECRET}`).toString('base64');

  const response = await axios.get('https://ssapi.shipstation.com/orders', {
    headers: {
      Authorization: `Basic ${auth}`,
    },
    params: {
      orderStatus: 'awaiting_shipment',
      storeid: storeId,
      pageSize: 5,
    },
  });

  const orders = response.data.orders;
  const copiedFiles = [];

  for (const order of orders) {
    for (const item of order.items) {
      const copied = copyPng(item.sku, order.orderNumber, store);
      if (copied) {
        copiedFiles.push(copied);
      }
    }
  }

  return copiedFiles;
};

app.get('/fetch-transfers', async (req, res) => {
  try {
    const store = req.query.store;

    const storeMap = {
      coed: 521077,
      duke: 506068,
      tony: 521079,
    };

    const storeId = storeMap[store];

    if (!storeId) {
      return res.status(400).json({ error: 'Invalid or missing store parameter' });
    }

    const copiedFiles = await fetchTransfers(storeId, store);

    let message = `Transfers fetched for ${store}.`;
    if (copiedFiles.length > 0) {
      message += ` Files copied successfully.`;
    } else {
    message += ` No files were copied.`;
    }

    res.json({ message, files: copiedFiles });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching transfers');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
