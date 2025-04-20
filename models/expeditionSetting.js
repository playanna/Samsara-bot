const mongoose = require('mongoose');

// Define the schema for expedition settings
const expeditionSettingSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // User's Discord ID
  autosell: { type: Boolean, default: false },
  expeditions: { type: Number, default: 0 },
  longestWinStreak: { type: Number, default: 0 },
  misfortunes: { type: Number, default: 0 },
  sellMultiplier: { type: Number, default: 1.0 },
  traderXP: { type: Number, default: 0 },
  winStreak: { type: Number, default: 0 },
  realm: { type: String, default: 'verdant' }, // Default realm
});

// Create and export the model
const ExpeditionSettings = mongoose.model('expeditionSetting', expeditionSettingSchema);
module.exports = ExpeditionSettings;
