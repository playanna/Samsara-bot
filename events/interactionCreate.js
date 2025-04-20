const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            // Handle slash commands
            const command = interaction.client.slashCommands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: 'There was an error executing this command!',
                    ephemeral: true
                });
            }
        } else if (interaction.isButton()) {
            // Handle button interactions
            if (interaction.customId.startsWith('shop_') || interaction.customId.startsWith('clan_') || interaction.customId.startsWith('gear_') || interaction.customId.startsWith('accept-') || interaction.customId.startsWith('reject-')) return; // Handled inline by /shop command           
            const buttonHandlerFile = path.join(__dirname, '../utils/buttons', `${interaction.customId}.js`);          
            if (fs.existsSync(buttonHandlerFile)) {
                // Dynamically require the button handler file
                const buttonHandler = require(buttonHandlerFile);
                await buttonHandler.execute(interaction);
            } else {
                console.error('Button handler not found for customId:', interaction.customId);
            }
        }

        else if (interaction.isModalSubmit()) {
            const modalHandlerFile = path.join(__dirname, '../utils/modals', `${interaction.customId}.js`);
        
            if (fs.existsSync(modalHandlerFile)) {
                try {
                    const modalHandler = require(modalHandlerFile);
                    await modalHandler.execute(interaction);
                } catch (err) {
                    console.error('Error handling modal:', err);
                    await interaction.reply({
                        content: '❌ Something went wrong while processing your input.',
                        ephemeral: true
                    });
                }
            } else {
                console.warn(`Modal handler not found for customId: ${interaction.customId}`);
                await interaction.reply({
                    content: '❌ This form is not supported or has expired.',
                    ephemeral: true
                });
            }
        }        
          
    }
};
