const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ExpeditionSettings = require('../../models/expeditionSetting');
const Multipliers = require('../../models/multipliers');
const createBaseEmbed = require('../../utils/embed');
const Xp = require('../../models/xp');

async function findOrCreate(Model, query, defaults = {}) {
  let doc = await Model.findOne(query);
  if (!doc) {
    doc = new Model({ ...query, ...defaults });
    await doc.save();
  }
  return doc;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Inspect your cultivation journey and Dao achievements'),

  async execute(interaction) {
    const user = interaction.user;
    const userId = user.id;
    

    try {
      const xpData = await Xp.findOne({ userId }) || { xp: 0 };
      const xp = xpData.xp;
      const baseXP = 100;
      let stage = 0;
      let nextStageXP = 0;

      while (true) {
        nextStageXP = baseXP * Math.pow(stage + 1, 2);
        if (xp < nextStageXP) break;
        stage++;
      }

      const [settings, multipliers] = await Promise.all([
        findOrCreate(ExpeditionSettings, { userId }, {
          expeditions: 0,
          autosell: false,
          sellMultiplier: 1.0,
          traderXP: 0,
          winStreak: 0,
          longestWinStreak: 0,
          misfortunes: 0
        }),
        findOrCreate(Multipliers, { userId }, {
          lootMultiplier: 1.0,
          cooldownReduction: 1.0,
          xpMultiplier: 1.0,
          jackpotBoost: 0,
          lossProtection: 1.0
        })
      ]);

      // Cultivation calculations
      const sellMultiplier = settings.sellMultiplier;
      const jackpotChance = multipliers.jackpotBoost + 5;
      const lossProtectionPercent = (1.0 - multipliers.lossProtection) * 100;
      const cultivationRank = calculateRank(stage);

      const embed = createBaseEmbed({
        interaction,
        title: `🀄 Your Dao Heart Report: `,
        thumbnail: interaction.user.displayAvatarURL({ dynamic: true }),
        image: 'https://i.ibb.co/cS7gnj1W/meditation-chambers.gif',
        color: 0x5e35b1, // Deep purple for cultivation chambers
        description: [
          `> *"It rains outside your quiet chamber as you review your cultivation journey..."*`,
          `\n**${cultivationRank}**`,
          `*"${getRankLore(cultivationRank)}"*`
        ].join('\n'),
        fields: [
          {
            name: '**Realm Exploration Records**',
            value: [
              `☯ **\`Total Expeditions\`**: ${settings.expeditions}`,
              `🔥 **\`Qi Surge Streak\`**: ${settings.winStreak}`,
              `🏆 **\`Longest Qi Surge\`**: ${settings.longestWinStreak}`,
              `💢 **\`Qi Deviations (Failures)\`**: ${settings.misfortunes}`
            ].join('\n'),
            inline: false
          },
          {
            name: '**Cultivation Protections**',
            value: [
              `🎋 **\`Auto-Sell\`**: ${settings.autosell ? '✅ Active' : '❌ Inactive'}`,
              `🛡️ **\`Tribulation Resistance\`**: ${lossProtectionPercent.toFixed(1)}%`,
              `🍵 **\`Meditation Efficiency\`**: x${multipliers.cooldownReduction.toFixed(2)}`,
              `🎰 **\`Heaven's Favor Chance\`**: ${jackpotChance}%`
            ].join('\n'),
            inline: false
          },
          {
            name: '**Dao Comprehension**',
            value: [
              `📚 **\`Enlightenment Multiplier\`**: x${multipliers.xpMultiplier.toFixed(2)}`,
              `💰 **\`Spiritual Trade Mastery\`**: x${sellMultiplier.toFixed(4)}`,
              `📦 **\`Karmic Harvest Boost\`**: x${multipliers.lootMultiplier.toFixed(2)}`,
              `\n*"${getRandomWisdom()}"*`
            ].join('\n'),
            inline: false
          }
        ],
        footer: {
          text: '「修行千年，不如明心见性」\n"A thousand years of cultivation比不上明心见性"',
          iconURL: interaction.guild?.iconURL({ dynamic: true }) || null,
        }
      });

      const row2 = new ActionRowBuilder()
             .addComponents(
               new ButtonBuilder()
                 .setCustomId('sect_rank')
                 .setLabel('Check Cultivation Rank')
                 .setStyle(ButtonStyle.Primary),
               new ButtonBuilder()
                  .setCustomId('sect_hall')
                              .setLabel('Sect halls')
                              .setStyle(ButtonStyle.Primary),            
             );

      await interaction.reply({ embeds: [embed], components: [row2] });

    } catch (err) {
      console.error('❌ Dao Heart inspection failed:', err);
      await interaction.reply({
        content: '⚠️ Your spiritual records were lost in a qi deviation...',
        ephemeral: true
      });
    }
  }
};

// --- Cultivation Helpers ---
function calculateRank(expeditions) {
  const ranks = [
    { name: 'Mortal Flesh (凡躯)', threshold: 0 },
    { name: 'Qi Refining (炼气期)', threshold: 10 },
    { name: 'Foundation Establishment (筑基期)', threshold: 20 },
    { name: 'Golden Core (金丹真人)', threshold: 30 },
    { name: 'Nascent Soul (元婴老祖)', threshold: 40 },
    { name: 'Divine Transformation (化神期)', threshold: 50 }
  ];
  
  return ranks.slice().reverse().find(r => expeditions >= r.threshold).name;
}

function getRankLore(rank) {
  const lore = {
    'Mortal Flesh (凡躯)': 'You barely sense the spiritual winds. Keep meditating.',
    'Qi Refining (炼气期)': 'Qi flows through your meridians like a gentle stream.',
    'Foundation Establishment (筑基期)': 'Your Dao foundation is set - the path unfolds before you.',
    'Golden Core (金丹真人)': 'A golden sun burns in your dantian, radiating power.',
    'Nascent Soul (元婴老祖)': 'Your infant soul peers into the mysteries of the universe.',
    'Divine Transformation (化神期)': 'You walk where mortals dare not dream.'
  };
  return lore[rank];
}

function getRandomWisdom() {
  const wisdoms = [
    "The mountain does not laugh at the river for being small",
    "When drinking water, remember its source",
    "A journey of a thousand miles begins with a single step",
    "The soft overcomes the hard; the weak overcomes the strong",
    "He who knows others is wise; he who knows himself is enlightened"
  ];
  return wisdoms[Math.floor(Math.random() * wisdoms.length)];
}