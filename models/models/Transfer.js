import mongoose from "mongoose";

const TransferSchema = new mongoose.Schema(
  {
    store: { type: String, required: true },
    orderNumber: { type: String, required: true },
    sku: { type: String, required: true },
    baseSku: { type: String, required: true },
    quantityIndex: { type: Number, default: 1 },
    fileName: { type: String, required: true },
    skipped: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.Transfer || mongoose.model("Transfer", TransferSchema);
