const { SlashCommandBuilder } = require('discord.js');
const Xp = require('../../models/xp');
const createBaseEmbed = require('../../utils/embed');
const getUserRank = require('../../utils/getrank');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cultivation')
    .setDescription('Check your Dao attainment progress')
    .addUserOption(option =>
      option.setName('disciple')
        .setDescription('Peer into another cultivator\'s progress')
    ),

  async execute(interaction) {
    let targetUser;

if (interaction.isCommand() || interaction.isChatInputCommand()) {
  targetUser = interaction.options.getUser('disciple') || interaction.user;
} else {
  targetUser = interaction.user;
}

    
    const userId = targetUser.id;

    try {
      const xpData = await Xp.findOne({ userId }) || { xp: 0 };
      const xp = xpData.xp;

      // Get the user's rank based on XP
      const rank = await getUserRank(Xp, userId, 'xp');

      // Cultivation Stage Calculation
      const baseXP = 100;
      let stage = 0;
      let nextStageXP = 0;

      while (true) {
        nextStageXP = baseXP * Math.pow(stage + 1, 2);
        if (xp < nextStageXP) break;
        stage++;
      }

      const currentStageXP = xp - (baseXP * Math.pow(stage, 2));
      const requiredXP = nextStageXP - (baseXP * Math.pow(stage, 2));
      const percentage = Math.round((currentStageXP / requiredXP) * 100);
      const emoji = '<a:flamewhite:776074845435723807> '; // Flame emoji for Dao progress
      const emoji2 = '<a:flameheavenlymight:1361606122410086441> '; // Heavenly might emoji for enlightenment

      // Dao Comprehension Bar
      const daoBar = [emoji, emoji2];
      const barLength = 10;
      const filled = Math.floor((percentage / 100) * barLength);
      const progressBar = daoBar[1].repeat(filled) + daoBar[0].repeat(barLength - filled);

      // Cultivation Stage Titles
      const stageTitles = [
        'Mortal Flesh (凡躯)',
        'Qi Refining (炼气期)',
        'Foundation Establishment (筑基期)',
        'Golden Core (金丹期)',
        'Nascent Soul (元婴期)',
        'Divine Transformation (化神期)'
      ];
      const currentTitle = stageTitles[Math.floor(stage / 10)] || 'Ascended Immortal (飞升仙人)';

      // Embed
      const embed = createBaseEmbed({
        interaction,
        title: `☯ ${targetUser.globalName || targetUser.username}'s Dao Path`,
        description: [
          `> *"The heavens record your journey..."*`,
          `\n** Cultivation Stage**: ${currentTitle}`,
          `** Sect Rank**: #${rank ?? 'Unranked'}`,
          `** Stage** : ${stage}`,
          `\n**☯ Dao Progress**: ${currentStageXP}/${requiredXP} (**${percentage}%**)`,
          `**${progressBar}**`,
          `\n** Total Enlightenment**: ${xp}`
        ].join('\n'),
        color: 0x5e35b1, // Mystic purple
        thumbnail: targetUser.displayAvatarURL({ dynamic: true }),
        footer: {
          text: stage >= 3 
            ? '「大道至简，徐徐图之」\n"The Great Dao is simple, yet attained gradually"' 
            : '「千里之行，始于足下」\n"A thousand-mile journey begins with a single step"'
        }
      });

      await interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error('Cultivation command error:', err);
      await interaction.reply({
        content: '💢 *The Heavenly Dao obscures your cultivation record!*',
        ephemeral: true,
      });
    }
  },
};