const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const {
  initializeUserData,
  calculateExpeditionOutcome,
  applyLossOutcome,
  applySuccessOutcome
} = require('../../utils/workhelpers/workHelpers.js');
const { createLossEmbed, createSuccessEmbed } = require('../../utils/workhelpers/embedHelpers.js');

async function performWork(interaction, isButton = false) {
  const userId = interaction.user.id;

  try {
    const { multipliers, settings, xpData, handDoc, inventory } = await initializeUserData(userId);
    const outcome = calculateExpeditionOutcome(multipliers, settings.realm);

    if (outcome.isLoss) {
      const result = await applyLossOutcome({ handDoc, xpData, settings, multipliers, outcome });
      const embed = createLossEmbed(interaction, result, settings, outcome);
      return await interaction.reply({ embeds: [embed], components: getRetryButtons() });
    }

    const successData = await applySuccessOutcome({ outcome, handDoc, xpData, settings, multipliers, inventory });
    const embed = createSuccessEmbed(interaction, successData, settings, multipliers);
    await interaction.reply({ embeds: [embed], components: getRetryButtons() });

  } catch (err) {
    console.error(`Work command failed for user ${userId}`, err);
    const content = `❌ Chaotic energy disrupted your cultivation. Error: ${err.message || 'Unknown error'}`;
    return isButton
      ? interaction.update({ content, components: [], embeds: [], ephemeral: true })
      : interaction.reply({ content, ephemeral: true });
  }
}

function getRetryButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('work_again').setLabel('✨ Work Again').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('sect_welcome').setLabel('Return to sect').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('sell_all').setLabel('💰 Sell All').setStyle(ButtonStyle.Danger),
    )
  ];
}

module.exports = {
  data: new SlashCommandBuilder().setName('work').setDescription('Embark on a cultivation expedition to earn XP and rare items'),
  async execute(interaction) {
    await performWork(interaction, false);
  },
  async handleButton(interaction) {
    if (interaction.customId === 'work_again') {
      await performWork(interaction, true);
    }
  }
};