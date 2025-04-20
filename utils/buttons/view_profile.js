module.exports = {
    data: {
      customId: 'view_profile',
      label: '📜 View Profile',
      style: 'SECONDARY'
    },
  
    async execute(interaction) {
      const profileCommand = require('../../Slashcommands/xp/profile'); // Adjust path if needed
      await profileCommand.execute(interaction); // Runs the profile logic
    }
  };
  