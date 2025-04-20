const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'Slashcommands');
const getSlashCommandFiles = (dirPath) => {
    let commandFiles = [];

    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(dirPath, file.name);

        if (file.isDirectory()) {
            commandFiles = commandFiles.concat(getSlashCommandFiles(fullPath));
        } else if (file.name.endsWith('.js')) {
            commandFiles.push(fullPath);
        }
    }

    return commandFiles;
};

const slashCommandFiles = getSlashCommandFiles(commandsPath);

for (const file of slashCommandFiles) {
    const command = require(file);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.warn(`Skipped file: ${file} - Missing "data" or "execute" export`);
    }
}


const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        // Publish commands to the first dev server
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID_2), 
            { body: commands },
        );

        // Publish commands to the second dev server
        //await rest.put(
        //    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID_2), 
        //    { body: commands },
        //);

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
