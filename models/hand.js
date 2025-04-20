const mongoose = require('mongoose');

const handSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
});

// ✅ Check if the model already exists before defining it
const Hand = mongoose.models.Hand || mongoose.model('Hand', handSchema);

module.exports = Hand;
