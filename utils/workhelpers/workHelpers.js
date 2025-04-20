const Xp = require('../../models/xp.js');
const Multipliers = require('../../models/multipliers');
const ExpeditionSettings = require('../../models/expeditionSetting');
const Inventory = require('../../models/inventory');
const Hand = require('../../models/hand');
const { getRandomLoot } = require('../lootTables');

async function findOrCreate(Model, query, defaults = {}) {
  let doc = await Model.findOne(query);
  if (!doc) {
    doc = new Model({ ...query, ...defaults });
    await doc.save();
  }
  return doc;
}

async function initializeUserData(userId) {
  const [multipliers, settings, xpData, handDoc, inventory] = await Promise.all([
    findOrCreate(Multipliers, { userId }),
    findOrCreate(ExpeditionSettings, { userId }),
    findOrCreate(Xp, { userId }, { xp: 0, level: 1 }),
    findOrCreate(Hand, { userId }, { balance: 0 }),
    findOrCreate(Inventory, { userId }, { items: [] })
  ]);
  return { multipliers, settings, xpData, handDoc, inventory };
}

function calculateExpeditionOutcome(multipliers, realm) {
  const lootLevel = multipliers.lootUpgradeLevel || 0;
  const lootMultiplier = Math.max(1, (multipliers.lootMultiplier || 1) * Math.pow(2, lootLevel));
  const lootCount = Math.floor(lootMultiplier);
  const isJackpot = Math.random() < (0.05 + (multipliers.jackpotBoost || 0) / 100);
  const isLoss = Math.random() < ((multipliers.lossChance || 0.05) * (multipliers.lossProtection || 1));
  return { isJackpot, isLoss, lootCount, lootMultiplier, realm };
}

async function applyLossOutcome({ handDoc, xpData, settings, outcome }) {
  const estimatedValue = Math.floor((Math.random() * 20 + 10) * outcome.lootMultiplier);
  const lossCoins = estimatedValue * 4;
  const lostXp = Math.floor((Math.random() * 16 + 10) * 4);

  xpData.xp = Math.max(0, xpData.xp - lostXp);
  handDoc.balance = Math.max(0, handDoc.balance - lossCoins);
  settings.misfortuneCount = (settings.misfortuneCount || 0) + 1;
  settings.winStreak = 0;

  await Promise.all([xpData.save(), handDoc.save(), settings.save()]);
  return { lostXp, lossCoins };
}

async function applySuccessOutcome({ outcome, xpData, settings, multipliers, inventory, handDoc }) {
  let lootCount = outcome.lootCount;
  if (outcome.isJackpot) lootCount *= 2;

  const loots = Array.from({ length: lootCount }, () => getRandomLoot(outcome.realm));
  if (Math.random() < outcome.lootMultiplier % 1) loots.push(getRandomLoot(outcome.realm));

  let totalLootValue = 0;
  let lootXpBonus = 0;
  const lootMap = new Map();

  for (const item of loots) {
    totalLootValue += item.value;
    lootXpBonus += Math.floor(item.value / 2);
    const entry = lootMap.get(item.name);
    entry ? entry.quantity++ : lootMap.set(item.name, { ...item, quantity: 1 });
  }

  if (outcome.isJackpot) lootXpBonus *= 2;

  if (settings.autosell) {
    handDoc.balance += totalLootValue;
    await handDoc.save();
  } else {
    const inventoryMap = new Map(inventory.items.map(i => [i.name, i]));
    for (const { name, value, quantity } of lootMap.values()) {
      const item = inventoryMap.get(name);
      item ? item.quantity += quantity : inventory.items.push({ name, value, quantity });
    }
    await inventory.save();
  }

  let xp = Math.floor((Math.random() * 16) + 10 + lootXpBonus);
  xp *= multipliers.xpMultiplier || 1;

  xpData.xp += xp;
  settings.expeditions++;
  settings.winStreak++;
  settings.longestWinStreak = Math.max(settings.winStreak, settings.longestWinStreak);

  await Promise.all([xpData.save(), settings.save(), multipliers.save()]);

  return { loots: lootMap, totalLootValue, xp, isJackpot: outcome.isJackpot, autoSell: settings.autosell, realm: outcome.realm };
}

module.exports = {
  initializeUserData,
  calculateExpeditionOutcome,
  applyLossOutcome,
  applySuccessOutcome
};
