const { SlashCommandBuilder } = require('discord.js');
const Bank = require('../../models/bank');
const Hand = require('../../models/hand');
const createBaseEmbed = require('../../utils/embed');
const sortLeaderboard = require('../../utils/sortLeaderboard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the top users by bank or hand balance')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('Choose which leaderboard to view')
        .setRequired(true)
        .addChoices(
          { name: 'Bank', value: 'bank' },
          { name: 'Hand', value: 'hand' }
        )
    )
    .addStringOption(option =>
      option
        .setName('order')
        .setDescription('Sort the leaderboard in ascending or descending order')
        .setRequired(false)
        .addChoices(
          { name: 'Ascending', value: 'asc' },
          { name: 'Descending', value: 'desc' }
        )
    ),

  async execute(interaction) {
    const category = interaction.options.getString('category');
    const order = interaction.options.getString('order') || 'desc'; // Default to 'desc'
    const Model = category === 'bank' ? Bank : Hand;
    const userId = interaction.user.id;

    try {
      await interaction.deferReply();

      // Fetch the top 10 users
      const topUsers = await Model.find()
        .sort({ balance: -1 })
        .limit(10);

      if (topUsers.length === 0) {
        return interaction.editReply(`❌ No data found for the ${category} leaderboard.`);
      }

      // Sort the leaderboard based on the selected order
      const sortedUsers = sortLeaderboard(topUsers, 'balance', order);

      // Generate the leaderboard
      const leaderboard = await Promise.all(
        sortedUsers.map(async (entry, index) => {
          try {
            const user = await interaction.client.users.fetch(entry.userId);
            const displayName = user.globalName || user.username;
            return `**${index + 1}.** ${displayName} — $${entry.balance.toFixed(2)}`;
          } catch {
            return `**${index + 1}.** Unknown User — $${entry.balance.toFixed(2)}`;
          }
        })
      );

      // Create the embed with leaderboard data
      const embed = createBaseEmbed({
        interaction,
        title: `🏆 Top 10 ${category === 'bank' ? 'Bank' : 'Hand'} Balances`,
        description: leaderboard.join('\n'),
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error generating leaderboard:', error);
      await interaction.editReply({
        content: '❌ Something went wrong while generating the leaderboard.',
        ephemeral: true,
      });
    }
  },
};
