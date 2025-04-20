const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
});

const inventorySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [itemSchema],
});

const Inventory = mongoose.model('Inventory', inventorySchema);
module.exports = Inventory;
