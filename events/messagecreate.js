const Hand = require('../models/hand'); // adjust path as needed

// Optional cooldown set
const cooldown = new Set();

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    // Ignore bots
    if (message.author.bot) return;

    // 💰 Passive Chat Reward
    // ---------------------
    if (!message.content.startsWith('!')) {
      const userId = message.author.id;

      // Cooldown to prevent abuse (1 min)
      if (cooldown.has(userId)) return;
      cooldown.add(userId);
      setTimeout(() => cooldown.delete(userId), 2000); // 60s cooldown

      try {
        let handData = await Hand.findOne({ userId });

        if (!handData) {
          handData = new Hand({ userId, balance: 0 });
        }

        const reward = Math.floor(Math.random() * 11) + 5; // $5 - $15
        handData.balance += reward;
        await handData.save();

        // Optional: Debug log
        // console.log(`${message.author.tag} earned $${reward}`);
      } catch (err) {
        console.error('Error adding chat reward:', err);
      }

      return; // Exit after passive reward logic for non-commands
    }

    // ---------------------
    // 🔧 Prefix Command Handling
    // ---------------------
    const prefix = '!';

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = message.client.commands.get(commandName);
    if (!command) return;

    try {
      await command.execute(message, args);
    } catch (error) {
      console.error(error);
      await message.reply('There was an error executing that command!');
    }
  },
};
