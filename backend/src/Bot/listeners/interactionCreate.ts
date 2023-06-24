import userinfo from 'Bot/actions/userinfo'
import statistics from 'Bot/actions/statistics'

import {
    CommandInteraction, Client, Interaction,
    ButtonInteraction,
} from 'discord.js'
import { Db } from 'mongodb'

export default (client: Client, db: Db): void => {
    client.on('interactionCreate', async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            await handleSlashCommand(client, interaction, db)
        }
        if (interaction.isButton()) {
            await handleButtonInteraction(client, interaction, db)
        }
    })
}

const handleSlashCommand = async (client: Client, interaction: CommandInteraction, db: Db): Promise<void> => {
    switch (interaction.commandName) {
        case 'userinfo':
            await userinfo(client, interaction, db);
            break;
        case 'statistics':
            await statistics(client, interaction, db);
            break;
    }
}

const handleButtonInteraction = async (client: Client, interaction: ButtonInteraction, db: Db): Promise<void> => {
//     if (interaction.customId === 'event-participate') {
//         return;
//     }
}
