// Slashcommands/economy/bal.js
const { SlashCommandBuilder } = require('discord.js');
const Bank = require('../../models/bank'); // Import the Bank model
const Hand = require('../../models/hand'); // Import the Hand model
const Clanpoints = require('../../models/clanpoints'); // Import the Clanpoints model
const createBaseEmbed = require('../../utils/embed'); // Import the embed utility - assumed to handle EmbedBuilder

// Define your spirit stone representation consistently
const spiritStoneSymbol = '<:karmicstone:757981408143868034> ';
const clanpointssymbol = `<:heavenlyorbs:776075202849013770>`; // Use the same symbol as before

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bal')
    .setDescription('Check your wealth and merit'), // Slightly more descriptive

  async execute(interaction) {
    const userId = interaction.user.id;
    const userName = interaction.user.globalName || interaction.user.username; // Use global name, fallback to username

    try {
      // --- Data Fetching (Optimized slightly) ---
      // Use Promise.all for concurrent fetching if your DB driver supports it well
      // Otherwise, sequential fetching is fine.
      let [bankData, handData, clanpointsData] = await Promise.all([
        Bank.findOneAndUpdate({ userId }, {}, { upsert: true, new: true, setDefaultsOnInsert: true }),
        Hand.findOneAndUpdate({ userId }, {}, { upsert: true, new: true, setDefaultsOnInsert: true }),
        Clanpoints.findOneAndUpdate({ userId }, {}, { upsert: true, new: true, setDefaultsOnInsert: true })
      ]);
      // Note: findOneAndUpdate with upsert:true can replace the find + create logic

      // --- Prepare Display Values ---
      // Using Intl.NumberFormat for better number presentation (e.g., commas) if desired,
      // but sticking to simple toFixed(2) for currency as requested/implied.
      // Using || 0 to ensure we display 0 if data is somehow null/undefined after upsert (shouldn't happen with setDefaultsOnInsert:true)
      const bankBalance = (bankData?.balance || 0);
      const handBalance = (handData?.balance || 0);
      const clanPoints = (clanpointsData?.balance || 0); // Assuming clan points are integers

      // --- Create the Embed ---
      const embed = createBaseEmbed({ // Assuming createBaseEmbed adds timestamp/footer
        interaction, // Pass interaction for context (e.g., footer)
        title: `◈ ${userName}'s Treasury ◈`, // Added symbols, more thematic title
        // Description can be minimal as fields carry the main info
        description: `An overview of your current holdings:`,
        fields: [
          {
            name: 'Spirit Pouch', // More thematic name for 'Hand'
            // Use inline code blocks for numbers, add the symbol
            value: `\`${handBalance.toFixed(2)}\` ${spiritStoneSymbol}`,
            inline: true
          },
          {
            name: 'Bank Vault', // More thematic name for 'Bank'
            value: `\`${bankBalance.toFixed(2)}\` ${spiritStoneSymbol}`,
            inline: true
          },
          {
            name: 'Clan Merit', // More thematic name for 'Clanpoints'
            // Assuming Clan Points are whole numbers, no toFixed(2).
            // Use a different symbol or just text if it's not spirit stones. Let's use text for clarity.
            value: `\`${clanPoints}\` ${clanpointssymbol}`, // Use backticks, clarify unit
            inline: true // Keep inline if space allows, otherwise set to false if it feels cramped
          },
        ],
        color: 0x0099FF // Example color (adjust as needed)
      });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error(`Error executing /bal for ${userId}:`, error);
      // Provide a more user-friendly error, still ephemeral
      await interaction.reply({
         content: ' Hmmm... The spirits seem unable to recall your balances right now. Please try again later.',
         ephemeral: true
      });
    }
  },
};

