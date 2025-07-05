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

const copyPng = (sku, orderNumber) => {
  const pngFileName = `${sku}-${orderNumber}.png`;
  const sourceFolder = path.join(__dirname, 'sourcePNGs');
  const targetFolder = '/Users/cmm1158/Desktop/DTF';
  const sourcePngPath = path.join(sourceFolder, `${sku}.png`);
  const targetPngPath = path.join(targetFolder, pngFileName);

  if (!fs.existsSync(sourcePngPath)) {
    console.error(`PNG not found: ${sourcePngPath}`);
    return;
  }

  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
    console.log(`Created target folder: ${targetFolder}`);
  }

  fs.copyFileSync(sourcePngPath, targetPngPath);
  console.log(`Copied: ${pngFileName}`);
};

const fetchTransfers = async () => {
  const auth = Buffer.from(`${SHIPSTATION_API_KEY}:${SHIPSTATION_API_SECRET}`).toString('base64');

  const response = await axios.get('https://ssapi.shipstation.com/orders', {
    headers: {
      Authorization: `Basic ${auth}`,
    },
    params: {
      orderStatus: 'awaiting_shipment',
      storeid: 521077,
      pageSize: 5,
    },
  });

  const orders = response.data.orders;

  for (const order of orders) {
    for (const item of order.items) {
      copyPng(item.sku, order.orderNumber);
    }
  }
};

app.get('/copy-png', (req, res) => {
  const sku = req.query.sku;
  const orderNumber = req.query.orderNumber;

  if (!sku || !orderNumber) {
    return res.status(400).send('Missing sku or orderNumber');
  }

  copyPng(sku, orderNumber);
  res.send('PNG copied successfully!');
});

app.get('/fetch-transfers', async (req, res) => {
  try {
    await fetchTransfers();
    res.send('Transfers fetched and PNGs copied successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching transfers');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
