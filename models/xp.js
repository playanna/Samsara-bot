const mongoose = require('mongoose');

const xpSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Xp', xpSchema);
