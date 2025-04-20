// utils/lootTables.js
const lootTables = {
    'verdant': [
      { name: 'Young Spirit Herb', value: 10 },
      { name: 'Emerald Toad’s Venom Sac', value: 12 },
      { name: 'Rough Spirit Stone', value: 8 },
      { name: 'Wooden Qi-Gathering Talisman', value: 5 },
      { name: 'Basic Healing Pill', value: 7 }
    ],
    'moon': [
      { name: 'Lunar Moth Wing', value: 20 },
      { name: 'Phantom Wolf Fang', value: 25 },
      { name: 'Moon-Touched Silver Ore', value: 18 },
      { name: 'Ghostward Amulet', value: 15 },
      { name: 'Moondew Elixir', value: 22 }
    ],
    'crimson': [
      { name: 'Blazing Lotus Petal', value: 35 },
      { name: 'Infernal Salamander Scale', value: 40 },
      { name: 'Crimson Spirit Iron', value: 30 },
      { name: 'Flame-Resistance Charm', value: 25 },
      { name: 'Bloodburn Restoration Pill', value: 32 }
    ],
    'abyssal': [
      { name: 'Drowned Sage’s Pearl', value: 50 },
      { name: 'Leviathan Tooth', value: 60 },
      { name: 'Abyssal Yin Metal', value: 45 },
      { name: 'Soul-Anchoring Jade', value: 40 },
      { name: 'Ghost Tide Revival Pill', value: 55 }
    ],
    'chains': [
      { name: 'Fractured Sky-Iron Shard', value: 75 },
      { name: 'Storm Drake’s Claw', value: 85 },
      { name: 'Heaven’s Shackle Fragment', value: 70 },
      { name: 'Lightning-Repelling Sigil', value: 65 },
      { name: 'Chainbreaker Rejuvenation Pill', value: 80 }
    ],
    'hells': [
      { name: 'Demon General’s Heart', value: 110 },
      { name: 'Hellfire Ruby', value: 120 },
      { name: 'Soulforged Blacksteel', value: 100 },
      { name: 'Blood Oath Contract Scroll', value: 95 },
      { name: 'Asura’s Rebirth Pill', value: 115 }
    ],
    'summit': [
      { name: 'Celestial Dragon’s Scale', value: 1000 },
      { name: 'Void-Splitting Saber Shard', value: 1200 },
      { name: 'Divine Dao Scripture Fragment', value: 1500 },
      { name: 'Starfire Essence', value: 1300 },
      { name: 'Tribulation-Proof Spirit Jade', value: 1400 },
      { name: 'Chrono Shard', value: 1100 },
      { name: 'Infinity Orb', value: 1300 },
    ],
  };
  
  /**
   * Returns a random item based on the user's cultivation realm.
   * @param {string} realm - The realm key (e.g., 'foundation', 'core').
   * @returns {{ name: string, value: number }}
   */
  function getRandomLoot(realm = 'mortal') {
    const lootPool = lootTables[realm] || lootTables['mortal'];
    return lootPool[Math.floor(Math.random() * lootPool.length)];
  }
  
  module.exports = { getRandomLoot };
  