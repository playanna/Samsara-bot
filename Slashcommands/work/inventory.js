const { SlashCommandBuilder } = require('discord.js');
const Inventory = require('../../models/inventory');
const createBaseEmbed = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('View the items you’ve collected during expeditions'),

  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      const inventory = await Inventory.findOne({ userId });
      const emoji = '<a:flameice:1361606119906344996> ';
    const spiritstones = '<:karmicstone:757981408143868034> ';

      if (!inventory || inventory.items.length === 0) {
        return await interaction.reply({
          content: ' Your inventory is empty. Go explore the realms with `/work`!',
          ephemeral: true,
        });
      }

      const itemList = inventory.items.map(item =>
        `• ${emoji}**${item.name}** × ${item.quantity} *(value: ${item.value} ${spiritstones})*`
      ).join('\n');

      const embed = createBaseEmbed({
        interaction,
        title: ` Here is your inventory!`,
        description: itemList,
        thumbnail: interaction.user.displayAvatarURL({ dynamic: true }),
      });

      await interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error('Error fetching inventory:', err);
      await interaction.reply({
        content: '❌ Could not retrieve your inventory. Try again later.',
        ephemeral: true,
      });
    }
  }
};
