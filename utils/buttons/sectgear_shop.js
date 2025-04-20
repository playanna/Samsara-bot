const { executeArmory } = require('../../Slashcommands/economy/shop');

module.exports = {
  data: {
    customId:'sectgear_shop',
    label: 'Go to armory',
    style: 'SECONDARY'
  },

  async execute(interaction) {
    await executeArmory(interaction, false); // true = followUp mode
    console.log('[Button] executeArmory:', typeof executeArmory);

  }
};

