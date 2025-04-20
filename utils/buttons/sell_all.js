module.exports = {
    data: {
      customId: 'sell_all',
      label: '💰 Sell All',
      style: 'SECONDARY'
    },
  
    async execute(interaction) {
      const sellCommand = require('../../Slashcommands/economy/sell'); // Adjust path if needed
      await sellCommand.execute(interaction); // Runs the profile logic
    }
  };
    // This is a button handler for the "Sell All" button in a Discord bot. It imports the sell command and executes it when the button is clicked. 