const createBaseEmbed = require('../embed.js');

// Realm data library
const REALMS = {
  verdant: {
    name: 'Verdant Genesis Valley (青源谷)',
    image: 'https://i.ibb.co/N6gFKmFp/Verdant-Genesis-Valley-pixel-a-1.jpg',
    danger: 'Earth Grade'
  },
  moon: {
    name: 'Shattered Moon Gorge (碎月峡)',
    image: 'https://i.ibb.co/m56sY2Qc/Shattered-Moon-Gorge-Su-yu-Xi.jpg',
    danger: 'Sky Grade'
  },
  crimson: {
    name: 'Crimson Vein Peaks (赤脉山)',
    image: 'https://i.ibb.co/ZRxLXVmj/Crimson-Vein-Peaks-Ch-m-i-Sh-n.jpg',
    danger: 'Inferno Grade'
  },
  abyssal: {
    name: 'Abyssal Ghost Sea (幽冥鬼海)',
    image: 'https://i.ibb.co/WWhpFSNc/Abyssal-Ghost-Sea-Y-um-ng-Gu-H.jpg',
    danger: 'Nether Grade'
  },
  chains: {
    name: 'Celestial Chains Desolation (天链荒原)',
    image: 'https://i.ibb.co/MkWm91r2/Celestial-Chains-Desolation-Ti-1.jpg',
    danger: 'Heaven Grade'
  },
  hells: {
    name: 'Nine Hells Blood Pagoda (九狱血塔)',
    image: 'https://i.ibb.co/LXHTWWqd/Nine-Hells-Blood-Pagoda-Ji-y-X.jpg',
    danger: 'Asura Grade'
  },
  summit: {
    name: 'Heaven-Devouring Summit (吞天巅)',
    image: 'https://i.ibb.co/ycf5Tysp/Heaven-Devouring-Summit-T-nti-1.jpg',
    danger: 'Cosmic Grade'
  }
};


function getRealmData(key) {
  return REALMS[key] || {
    name: 'Mortal Plains (凡尘)',
    image: 'https://i.ibb.co/mnT2LZF/WANEELLA-pixel-art.gif',
    danger: 'Mortal Grade'
  };
}


function createLossEmbed(interaction, { lostXp, lossCoins }, settings, outcome) {
  const realm = getRealmData(outcome.realm);
  const failureStories = [
    `While seeking enlightenment in ${realm.name}, you offended a wandering immortal and were struck down by their casual palm strike.`,
    `The ${realm.danger}-level beasts of ${realm.name} proved too much for your current cultivation.`,
    `A sudden qi deviation left you vulnerable to the dangers of ${realm.name}.`,
    `You triggered an ancient formation in ${realm.name} and were teleported to safety - barely alive.`
  ];

  return createBaseEmbed({
    interaction,
    title: '☯️ Cultivation Setback',
    description: [
      `> ${failureStories[Math.floor(Math.random() * failureStories.length)]}`,
      `\n💢 **Karmic Consequences**:`,
      `- **Lost ${lossCoins} Spirit Stones** (medical elixirs)`,
      `- **-${lostXp} Dao Comprehension** (meridians damaged)`,
      `- **Qi Deviation Count**: ${settings.misfortuneCount}`,
      `\n*"Even immortals face setbacks. Meditate and try again when your qi stabilizes."*`
    ].join('\n'),
    color: 0x8B0000, // Blood red
    footer: {
      text: '「失败乃成功之母」\n"Failure is the mother of success"',
      iconURL: interaction.guild?.iconURL({ dynamic: true }) || null,
    }
  });
}

function createSuccessEmbed(interaction, { loots, totalLootValue, xp, isJackpot, autoSell, realm }, settings, multipliers) {
  const realmData = getRealmData(realm);
  const realmTier = realm;
  const emoji = '<a:flameice:1361606119906344996> ';
  const spiritstones = '<:karmicstone:757981408143868034> '; // For compatibility

  const jackpotTexts = [
    `🌠 **Heavenly Favour!** While cultivating in ${realmData.name}, you stumbled upon a heavenly secret!`,
    `💫 The cosmic alignment in ${realmData.name} amplified your rewards beyond mortal comprehension!`,
    `☯️ Your Dao heart resonated with ${realmData.name}'s ancient energies, triggering a karmic windfall!`
  ];

  const normalTexts = [
    `After 7 days and 7 nights in ${realmData.name}, you emerged with newfound treasures.`,
    `The ${realmData.danger}-level trials of ${realmData.name} have tempered your cultivation.`,
    `While avoiding spatial rifts in ${realmData.name}, you discovered an ancient cache.`,
    `The guardian spirit of ${realmData.name} tested you and found your Dao heart worthy.`
  ];

  const action = isJackpot 
    ? jackpotTexts[Math.floor(Math.random() * jackpotTexts.length)] 
    : normalTexts[Math.floor(Math.random() * normalTexts.length)];

  const lootText = [...loots.values()]
    .map(i => `- +${i.quantity}** ${emoji}${i.name}** `)
    .join('\n');

  return createBaseEmbed({
    interaction,
    title: isJackpot 
      ? '✨ 天命大机缘 (Heavenly Destiny Manifested)' 
      : ``,
    description: [
      `> ${action}`,
      `\n🌌 **Realm Conquered**: ${realmData.name}`,
      `☯ **Danger Level**: ${realmData.danger}-Grade`,
      `\n📿 **Cultivation Gains**:`,
      `- +${xp} **XP** (×${multipliers.xpMultiplier.toFixed(2)})`,
      `${lootText}`,
      autoSell ? `\n💰 *"The Celestial Bazaar has automatically traded your items."*` : '',
      isJackpot ? `\n✨ **天命加持**: *"The Heavenly Dao has blessed your harvest!"*` : '',
      `\n - Current Qi Surge: **${settings.winStreak}** | Longest Surge: **${settings.longestWinStreak}**`,
    ].filter(Boolean).join('\n'),
    color: isJackpot ? 0xFFD700 : getRealmColor(realmTier),
    image: realmData.image,
    footer: {
      text: isJackpot 
        ? '「福星高照」\n"Fortune\'s Star Shines Bright"' 
        : '「百尺竿头，更进一步」\n"Even at the top, climb further"',
      iconURL: interaction.guild?.iconURL({ dynamic: true }) || null,
    }
  });
}

function getRealmColor(tier) {
  const colors = [0x2ecc71, 0x3498db, 0xe74c3c, 0x9b59b6, 0x1abc9c, 0xe67e22, 0x2c3e50];
  return colors[tier - 1] || 0x95a5a6;
}

module.exports = {
  createLossEmbed,
  createSuccessEmbed
};