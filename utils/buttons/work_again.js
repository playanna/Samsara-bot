module.exports = {
    data: {
        customId: 'work_again', // Button ID
        label: '✨ Work Again',
        style: 'PRIMARY' // BUTTON STYLE (PRIMARY, DANGER, SECONDARY, LINK)
    },
    
    async execute(interaction) {
        // You can call the existing `work` logic here when the button is clicked.
        const workCommand = require('../../Slashcommands/work/work'); // Adjust path if necessary
        await workCommand.execute(interaction); // Execute the work command logic again
    }
};
