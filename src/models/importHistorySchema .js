const mongoose = require('mongoose');

const importHistorySchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    importedQuantity: { type: Number, required: true },
    importedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const ImportHistory = mongoose.model('ImportHistory', importHistorySchema);

module.exports = ImportHistory;
