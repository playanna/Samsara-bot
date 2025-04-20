const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
} = require('discord.js');
const Xp = require('../../models/xp');
const ExpeditionSettings = require('../../models/expeditionSetting');
const createBaseEmbed = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('realms')
    .setDescription('Attune your spirit to the sacred realms in the Elder Astral Chamber'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const user = interaction.user;

    try {
      const xpData = await Xp.findOne({ userId }) || { xp: 0 };
      const xp = xpData.xp;

      // Cultivation Stage Calculation
      const baseXP = 1000;
      let cultivationStage = 0;
      let nextStageXP = 0;
      while (true) {
        nextStageXP = baseXP * Math.pow(cultivationStage + 1, 3); // Cubic growth for harder progression
        if (xp < nextStageXP) break;
        cultivationStage++;
      }

      // Sacred Realm Definitions
      const realms = [
        { 
          name: 'Verdant Genesis Valley (青源谷)',
          key: 'verdant',
          minStage: 0,
          lore: 'Where nascent cultivators take their first steps amidst singing spiritual herbs',
          image: 'https://i.ibb.co/N6gFKmFp/Verdant-Genesis-Valley-pixel-a-1.jpg',
          danger: 'Earth Grade'
        },
        { 
          name: 'Shattered Moon Gorge (碎月峡)',
          key: 'moon',
          minStage: 15,
          lore: 'Celestial fragments hum with forgotten power under eternal twilight',
          image: 'https://i.ibb.co/m56sY2Qc/Shattered-Moon-Gorge-Su-yu-Xi.jpg',
          danger: 'Sky Grade'
        },
        { 
          name: 'Crimson Vein Peaks (赤脉山)',
          key: 'crimson',
          minStage: 30,
          lore: 'Volcanic arteries pulse with the primordial fire qi of creation',
          image: 'https://i.ibb.co/ZRxLXVmj/Crimson-Vein-Peaks-Ch-m-i-Sh-n.jpg',
          danger: 'Inferno Grade'
        },
        { 
          name: 'Abyssal Ghost Sea (幽冥鬼海)',
          key: 'abyssal',
          minStage: 45,
          lore: 'Drowned immortals whisper secrets in the endless yin mist',
          image: 'https://i.ibb.co/WWhpFSNc/Abyssal-Ghost-Sea-Y-um-ng-Gu-H.jpg',
          danger: 'Nether Grade'
        },
        { 
          name: 'Celestial Chains Desolation (天链荒原)',
          key: 'chains',
          minStage: 60,
          lore: 'Divine shackles rattle with the imprisoned fury of fallen gods',
          image: 'https://i.ibb.co/MkWm91r2/Celestial-Chains-Desolation-Ti-1.jpg',
          danger: 'Heaven Grade'
        },
        { 
          name: 'Nine Hells Blood Pagoda (九狱血塔)',
          key: 'hells',
          minStage: 75,
          lore: 'Each floor consumes a piece of your humanity in exchange for demonic power',
          image: 'https://i.ibb.co/LXHTWWqd/Nine-Hells-Blood-Pagoda-Ji-y-X.jpg',
          danger: 'Asura Grade'
        },
        { 
          name: 'Heaven-Devouring Summit (吞天巅)',
          key: 'summit',
          minStage: 90,
          lore: 'The sky bleeds where reality fractures under celestial combat',
          image: 'https://i.ibb.co/ycf5Tysp/Heaven-Devouring-Summit-T-nti-1.jpg',
          danger: 'Cosmic Grade'
        }
      ];

      const unlockedRealms = realms.filter(r => cultivationStage >= r.minStage);
      const lockedRealms = realms.filter(r => cultivationStage < r.minStage);

      let settings = await ExpeditionSettings.findOne({ userId });
      if (!settings) {
        settings = new ExpeditionSettings({ userId });
        await settings.save();
      }

      const currentRealm = realms.find(r => r.key === settings.realm) || realms[0];

      const embed = createBaseEmbed({
        interaction,
        title: '🪷 **Elder Astral Chamber**',
        description: [
          `> *The Astral Compass whirls as ${user.username}'s cultivation stage resonates through the chamber*`,
          `**Current Realm Alignment**: ${currentRealm.name}`,
          `**${currentRealm.danger} Danger Threshold**`,
          `*"${currentRealm.lore}"*`,
          `\n☯ **Your Cultivation Stage**: ${cultivationStage}`,
          `✨ **Next Breakthrough**: ${nextStageXP - xp} Enlightenment XP needed`,
          `\n*"Choose wisely - your realm determines both treasures and tribulations"*`
        ].join('\n'),
        color: 0x8A2BE2, // Cosmic purple
        image: currentRealm.image
      });

      // Unlocked Realms Field
      if (unlockedRealms.length > 0) {
        embed.addFields({
          name: '🌠 **Attunable Realms**',
          value: unlockedRealms.map(r => 
            `• **${r.name}** *(Stage ${r.minStage}+)*\n` +
            `*${r.danger} Danger • "${r.lore.slice(0, 60)}..."*`
          ).join('\n\n'),
          inline: false
        });
      }

      // Locked Realms Field
      if (lockedRealms.length > 0) {
        embed.addFields({
          name: '🔒 **Sealed Realms**',
          value: lockedRealms.map(r => 
            `• ${r.name} *(Requires Stage ${r.minStage})*\n` +
            `*"${r.danger} trials await..."*`
          ).join('\n\n'),
          inline: false
        });
      }

      // Realm Selection Menu
      const menu = new StringSelectMenuBuilder()
        .setCustomId('realm-select')
        .setPlaceholder('Channel your qi to attune...')
        .addOptions(
          unlockedRealms.map(r =>
            new StringSelectMenuOptionBuilder()
              .setLabel(r.name)
              .setDescription(`Stage ${r.minStage}+ • ${r.danger}`)
              .setValue(r.key)
              .setEmoji(r.key === currentRealm.key ? '🀄' : '✨')
          )
        );

      const row = new ActionRowBuilder().addComponents(menu);

      const message = await interaction.reply({
        embeds: [embed],
        components: [row],
        fetchReply: true
      });

      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 300000, // 5 minutes
        filter: i => i.user.id === userId,
      });

      collector.on('collect', async selectInteraction => {
        const selectedRealmKey = selectInteraction.values[0];
        const selectedRealm = realms.find(r => r.key === selectedRealmKey);

        // Prevent spamming realm changes
        if (selectedRealmKey === settings.realm) {
          return selectInteraction.reply({
            content: `🀄 You're already aligned with ${selectedRealm.name}!`,
            ephemeral: true
          });
        }

        settings.realm = selectedRealmKey;
        await settings.save();

        const confirmEmbed = createBaseEmbed({
          interaction,
          title: `🌌 **Realm Attunement: ${selectedRealm.name}**`,
          description: [
            `> *The Astral Compass shudders as your qi synchronizes with ${selectedRealm.name}*`,
            `**${selectedRealm.danger} Trials Await**:`,
            `*"${selectedRealm.lore}"*`,
            `\n${selectedRealm.key === 'summit' ? '☄️' : '✨'} **New Expedition Perks**:`,
            `- ${getRealmBonus(selectedRealm.key)}`,
            `- ${getRealmChallenge(selectedRealm.key)}`,
            `\n*"The heavens record your ambition in the Book of Destiny"*`
          ].join('\n'),
          color: getRealmColor(selectedRealm.key),
          image: selectedRealm.image,
          thumbnail: 'https://i.imgur.com/qi_convergence.png'
        });

        await selectInteraction.reply({
          embeds: [confirmEmbed],
          ephemeral: true
        });

        // Update original message
        await interaction.editReply({
          embeds: [embed.setImage(selectedRealm.image)],
          components: []
        });
      });

      collector.on('end', () => {
        if (!message.editable) return;
        message.edit({ components: [] }).catch(console.error);
      });

    } catch (err) {
      console.error('Astral Attunement Error:', err);
      await interaction.reply({
        content: '💢 The Astral Compass shattered! Your qi destabilized the chamber...',
        ephemeral: true,
      });
    }
  },
};

// Realm-specific bonuses
function getRealmBonus(realmKey) {
  const bonuses = {
    verdant: '+50% Spirit Herb discovery chance',
    moon: 'Moonlight enhances all yin-based techniques',
    crimson: 'Fire qi passively tempers your body',
    abyssal: 'Drowned spirits occasionally reveal secrets',
    chains: 'Divine shackle fragments boost defense',
    hells: 'Demonic pacts available in expeditions',
    summit: 'Heavenly dao fragments grant cosmic insights'
  };
  return bonuses[realmKey] || 'Unknown blessing';
}

// Realm-specific challenges
function getRealmChallenge(realmKey) {
  const challenges = {
    verdant: 'Ancient formations may trap the unwary',
    moon: 'Gravity anomalies distort spatial awareness',
    crimson: 'Volcanic eruptions occur unpredictably',
    abyssal: 'Leviathans may surface during storms',
    chains: 'Lightning tribulations strike randomly',
    hells: 'Demonic corruption accumulates over time',
    summit: 'Reality itself becomes unstable'
  };
  return challenges[realmKey] || 'Unknown trial';
}

// Realm-specific colors
function getRealmColor(realmKey) {
  const colors = {
    verdant: 0x2ECC71,
    moon: 0x3498DB,
    crimson: 0xE74C3C,
    abyssal: 0x9B59B6,
    chains: 0xF1C40F,
    hells: 0xE67E22,
    summit: 0x8A2BE2
  };
  return colors[realmKey] || 0xFFFFFF;
}