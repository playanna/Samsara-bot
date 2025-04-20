require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

if (process.env.NODE_ENV !== 'production') {
    require('./deploycommands');
}
const connectToMongoDB = require('./database/mongo');

(async () => {
    await connectToMongoDB();
})();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Load commands
client.commands = new Collection();
const commandsPath = './commands';
if (!fs.existsSync(commandsPath)) {
    console.error(`Error: The commands directory (${commandsPath}) does not exist.`);
    process.exit(1);
}
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}


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

client.slashCommands = new Collection();
const slashCommandsPath = path.join(__dirname, 'Slashcommands');

if (fs.existsSync(slashCommandsPath)) {
    const slashCommandFiles = getSlashCommandFiles(slashCommandsPath);

    for (const file of slashCommandFiles) {
        const command = require(file);
        client.slashCommands.set(command.data.name, command);
    }
} else {
    console.warn(`Warning: The Slashcommands directory (${slashCommandsPath}) does not exist.`);
}


// Load events
const eventsPath = './events';
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const event = require(`./events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
} else {
    console.warn(`Warning: The events directory (${eventsPath}) does not exist.`);
}
// Login
if (!process.env.TOKEN) {
    console.error('Error: Discord bot token is not defined in the environment variables.');
    process.exit(1);
}

client.login(process.env.TOKEN).catch(error => {
    console.error('Failed to login:', error);
    process.exit(1);
});
