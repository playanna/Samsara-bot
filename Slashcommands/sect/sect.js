const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
  } = require('discord.js');
  const createBaseEmbed = require('../../utils/embed');
  const sectLore = require('../../utils/sectlore.js'); // Import lore
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('sect-welcome')
      .setDescription('Welcome a disciple to the Heavenly Samsara Sect'),
  
    async execute(interaction) {
      const user = interaction.user;
      
      // Base embed
      const embed = createBaseEmbed({
        interaction,
        title: '🪷 天命轮回宗 | Destiny’s Samsara Sect 🪷',
        description: `> **☯️ 仙路漫漫，唯道作舟**\n*"The Dao shall be your vessel."*\n\n${user}, the spiritual winds stir...`,
        color: 0x8a2be2,
        image: 'https://i.ibb.co/4n1VkJTq/download-1.jpg',
        footer: {
            text: '「轮回无终，大道永恒」\n"Samsara is endless, yet the Great Dao is eternal."',
            iconURL: interaction.guild?.iconURL({ dynamic: true }) || null, // Reuse emblem
          },
      }).setAuthor({ 
        name: null,
        iconURL: null
      });
  
      // Lore navigation buttons
      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('clan_lore_prev')
            .setLabel('◀')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('clan_lore_next')
            .setLabel('▶')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('clan_lore_close')
            .setLabel('Close Lore')
            .setStyle(ButtonStyle.Danger)
        );
  
      await interaction.reply({
        
        content: `🀄 **${user}**, the sect elders sense your arrival. Kneel and receive their wisdom!`,
        embeds: [embed],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('work_again').setLabel('Set out to Adventure').setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('sect_hall')
              .setLabel('Sect halls')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('clan_show_lore')
              .setLabel('Sect Lore')
              .setStyle(ButtonStyle.Primary),
          )
        ]
      });
  
      // Button interaction handling
      const collector = interaction.channel.createMessageComponentCollector({ 
        time: 300_000 
      });
  
      let currentPage = 0;
      
      collector.on('collect', async i => {
        if (i.customId === 'clan_show_lore') {
          // Show first lore page
          await i.reply({
            embeds: [buildLoreEmbed(currentPage)],
            components: [buttons],
          });
        } 
        else if (i.customId.startsWith('clan_lore_')) {
          // Handle pagination
          if (i.customId === 'clan_lore_next') currentPage++;
          if (i.customId === 'clan_lore_prev') currentPage--;
          if (i.customId === 'clan_lore_close') {
            await i.deferUpdate();
            return i.deleteReply();
          }
  
          // Update buttons
          buttons.components[0].setDisabled(currentPage === 0);
          buttons.components[1].setDisabled(currentPage >= sectLore.length - 1);
  
          await i.update({
            embeds: [buildLoreEmbed(currentPage)],
            components: [buttons]
          });
        }
      });
    }
  };
  
  // Helper: Builds lore embed for given page
  function buildLoreEmbed(page) {
    const pageData = sectLore[page];
    return new EmbedBuilder()
      .setTitle(pageData.title)
      .setDescription(pageData.description)
      .addFields(pageData.fields || [])
      .setColor(0x8a2be2)
      .setFooter({ text: `Page ${page + 1}/${sectLore.length}` })
      .setImage(pageData.image || null)
      .setThumbnail(pageData.thumbnail || null);
  }