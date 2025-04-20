const { SlashCommandBuilder } = require('discord.js');
const Inventory = require('../../models/inventory');
const Hand = require('../../models/hand');
const ExpeditionSettings = require('../../models/expeditionSetting');
const createBaseEmbed = require('../../utils/embed');

function calculateSellMultiplier(traderXP) {
  return 1.0 + Math.floor(traderXP / 1000) * 0.1;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sell')
    .setDescription('Offer all your treasures to the Sect Treasury'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const spiritstones = '<:karmicstone:757981408143868034>';

    try {
      const inventory = await Inventory.findOne({ userId });
      if (!inventory || inventory.items.length === 0) {
        return await interaction.reply({
          content: '📜 *The Treasury Elder scoffs:* "Your qiankun pouch is emptier than a mortal\'s spiritual roots!"',
          ephemeral: true
        });
      }

      // Fetch or create expedition settings
      let settings = await ExpeditionSettings.findOne({ userId });
      if (!settings) {
        settings = new ExpeditionSettings({ userId });
      }

      const baseValue = inventory.items.reduce((sum, item) => sum + item.value * item.quantity, 0);
      const traderXpGained = Math.floor(baseValue / 5);
      settings.traderXP += traderXpGained;
      settings.sellMultiplier = calculateSellMultiplier(settings.traderXP);
      const multiplier = settings.sellMultiplier;
      const finalValue = Math.floor(baseValue * multiplier);

      await settings.save();

      // Update balance
      let hand = await Hand.findOne({ userId });
      if (!hand) {
        hand = new Hand({ userId, balance: 0 });
      }
      hand.balance += finalValue;
      await hand.save();

      // Clear inventory
      const soldItemsCount = inventory.items.reduce((sum, item) => sum + item.quantity, 0);
      inventory.items = [];
      await inventory.save();


const embed = createBaseEmbed({
  interaction,
  title: `◈ Divine Transaction Complete ◈`, // Added simple symbols for flair
  description: `> *"The Treasury Elder's eyes gleam as he waves his sleeve, absorbing your treasures into the sect vaults..."*`,
  color: 0x4b0082, // Deep indigo
  fields: [
    {
      name: 'Items Offered',
      value: `\`${soldItemsCount}\` spiritual items accepted by the Heavenly Samsara Sect.`,
      inline: false // Full width for emphasis
    },
    {
      name: 'Karmic Value Assessment',
      value: `Base Value: ~~ \`${baseValue}\` ~~ ${spiritstones}\nFinal Value: **\`${finalValue}\`** ${spiritstones}\n(Sell Multiplier: \`x${multiplier.toFixed(2)}\`)`,
      inline: true // Place side-by-side with next field if space allows
    },
    {
      name: 'Merit & Favor',
      value: `Merit Gained: \`+${traderXpGained}\` Treasury Favor XP\nCurrent Favor: \`${settings.traderXP}\` Treasury Favor XP`,
      inline: true // Place side-by-side with previous field
    },
    {
        name: 'Updated Balance',
        value: `Your Treasury Vault: **\`${hand.balance}\`** ${spiritstones}`,
        inline: false // Standalone at the bottom
    }
  ]
});



      await interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error('Error during sell command:', err);
      await interaction.reply({
        content: '💢 *The Treasury Elder coughs blood!* "The karmic ledgers are in chaos... try again later."',
        ephemeral: true
      });
    }
  }
};