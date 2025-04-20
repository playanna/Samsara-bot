const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');


async function loadDatabaseEvents() {
    const eventsPath = path.join(__dirname, 'events');
    const files = fs.readdirSync(eventsPath).filter(file =>
        file.endsWith('.js') || file.endsWith('.mjs')
    );

    for (const file of files) {
        const fullPath = path.join(eventsPath, file);

        let event;
        if (file.endsWith('.mjs')) {
            // ESM dynamic import
            const imported = await import(pathToFileURL(fullPath).href);

            event = imported.default;
        } else {
            // CommonJS require
            event = require(fullPath);
        }

        if (!event?.name || typeof event.execute !== 'function') {
            console.warn(`[DB Event Loader] Skipped invalid event file: ${file}`);
            continue;
        }

        mongoose.connection.on(event.name, (...args) => {
            event.execute(...args);
        });
    }
}

async function connectToMongoDB() {
    try {
        await loadDatabaseEvents(); // must await this now
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connection state:", mongoose.connection.readyState); // 1 = connected
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

module.exports = connectToMongoDB;
