module.exports = {
    data: {
      customId: 'sect_rank',
      label: 'Check Cultivation Rank',
      style: 'SECONDARY'
    },
  
    async execute(interaction) {
      const rankCommand = require('../../Slashcommands/xp/rank.js'); // Adjust path if needed
      await rankCommand.execute(interaction); // Runs the treasury logic
    }
  };
  // This is a button handler for the "Go to Treasury" button in a Discord bot. 
  // It imports the treasury command and executes it when the button is clicked.