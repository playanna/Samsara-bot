const Multipliers = require('../../models/multipliers');
const Hand = require('../../models/hand');
const createBaseEmbed = require('../../utils/embed');

function getProgressBar(percentage) {
  const barFull = '☯'; 
  const barEmpty = '○';
  const barLength = 10; // Shorter for elegance
  const filledLength = Math.floor((percentage / 100) * barLength);
  return `**[${barFull.repeat(filledLength)}${barEmpty.repeat(barLength - filledLength)}]**`;
}

function getUpgradeCost(level) {
  const baseCost = 100n;
  const multiplier = 100n;
  const levelBigInt = BigInt(level);
  return baseCost + multiplier * levelBigInt ** 6n; 
}

const execute = async (interaction) => {
  const userId = interaction.user.id;
  let multipliers = await Multipliers.findOne({ userId }) || new Multipliers({ userId });
  let hand = await Hand.findOne({ userId }) || new Hand({ userId });

  const currentLevel = multipliers.lootUpgradeLevel || 0;
  const maxLevel = 10;

  if (currentLevel >= maxLevel) {
    return await interaction.reply({
      content: '⚠️ You have already maxed out this upgrade.',
      ephemeral: true,
    });
  }

  const cost = getUpgradeCost(currentLevel);

  if (hand.balance < cost) {
    return await interaction.reply({
      content: `🚫 You need **${cost} coins** but only have **${hand.balance}**.`,
      ephemeral: true,
    });
  }

  // Perform upgrade
  hand.balance = Number(BigInt(hand.balance) - cost); // convert BigInt to Number
  multipliers.lootUpgradeLevel = currentLevel + 1;
  await hand.save();
  await multipliers.save();

  // Prepare new embed & button
  const newLevel = multipliers.lootUpgradeLevel;
  const lootPercentage = Math.floor((newLevel / maxLevel) * 100);
  const progressBar = getProgressBar(lootPercentage);
  const nextCost = getUpgradeCost(newLevel);
  const canAfford = hand.balance >= nextCost;
  const emoji = '<a:flameice:1361606119906344996> ';
  const spiritstones = '<:karmicstone:757981408143868034> '; 

  const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const button = new ButtonBuilder()
    .setCustomId('upgrade_loot')
    .setLabel(
      newLevel >= maxLevel 
        ? '✅ 大道已成 (Great Dao Mastered)' 
        : `突破瓶颈 (Spirit Sense) — ${nextCost} Spirit Stones`
      )
    .setStyle(ButtonStyle.Primary)
    .setDisabled(!canAfford || newLevel >= maxLevel);
  const sectHallButton = new ButtonBuilder()
        .setCustomId('sect_hall')
        .setLabel('Return to Sect Hall')
        .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(button);
  const sectRow = new ActionRowBuilder().addComponents(sectHallButton);


  const embed = createBaseEmbed({
    interaction,
    title: `🪷 **Your Cultivation Progress:**`,
    description: [
      `> **"${getBreakthroughQuote(newLevel)}"**\n`,
      `** ${emoji} Spiritual Sense Upgrade** *(Tier ${newLevel})*`,
      `- **Realm**: ${getCultivationRealm(newLevel)}`,
      `- **Qi Sensitivity**: x${Math.pow(2, newLevel)} (loot multiplier)`,
      `- **Meridian Purity**: ${progressBar} ${lootPercentage}%`,
      `\n **Available balance**: ${hand.balance} ${spiritstones}`,
      newLevel < maxLevel 
        ? ` **Next Breakthrough Cost**: ${nextCost} ${spiritstones}` 
        : ` **"The heavens tremble at your perception!"**`,
    ].join('\n'),
    color: newLevel >= maxLevel ? 0xffd700 : 0x5e35b1, // Gold for max level
    footer: {
      text: '「轮回无终，大道永恒」\n"Samsara is endless, yet the Great Dao is eternal."',
      iconURL: interaction.guild?.iconURL({ dynamic: true }) || null, // Reuse emblem
    },
  });

  await interaction.update({ embeds: [embed], components: [row, sectRow] });
};

function getCultivationRealm(level) {
  const realms = [
    'Mortal Flesh (凡躯)',
    'Qi Perception (感气期)',
    'Meridian Awakening (通脉期)',
    'Golden Core Formation (金丹期)',
    'Nascent Soul (元婴期)',
    'Divine Transformation (化神期)',
    'Void Tribulation (渡劫期)',
    'Half-Step Immortal (半步真仙)',
    'Earth Immortal (地仙)',
    'Heavenly Sovereign (天尊)'
  ];
  return realms[level] || 'Unranked';
}

function getRandomTrainingGroundsQuote() {
  const quotes = [
    '"The Dao is silent, but your meridians scream."',
    '"Ten thousand steps begin with one breath."',
    '"A butterfly dreams of Qi; a cultivator dreams of eternity."',
    '"To refine the body, first refine the mind."',
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function getBreakthroughQuote(newLevel) {
  const quotes = {
    1: 'Your pores open—you sense the Qi of ants crawling three miles away.',
    5: 'Your Golden Core pulses like a newborn sun!',
    9: 'The Void itself whispers secrets into your Nascent Soul...',
    10: 'ASCENSION! The Heavenly Dao acknowledges your supremacy!'
  };
  return quotes[newLevel] || 'A ripple of power surges through your meridians.';
}

module.exports = { execute };
