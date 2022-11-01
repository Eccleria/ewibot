import { SlashCommandBuilder } from "@discordjs/builders";

import { interactionReply } from "./utils.js";
import { PERSONALITY } from "../personality.js";

const command = new SlashCommandBuilder()
    .setName(PERSONALITY.getCommands().gift.name)
    .setDescription(PERSONALITY.getCommands().gift.description)
    .addUserOption((option) => 
        option
            .setName(PERSONALITY.getCommands().gift.userOption.name)
            .setDescription(PERSONALITY.getCommands().gift.userOption.description)
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName(PERSONALITY.getCommands().gift.textOption.name)
            .setDescription(PERSONALITY.getCommands().gift.textOption.description)
            .setRequired(true)
    )

const action = async (interaction) => {

};

const gift = {
    action,
    command,
    help: (interaction) => {
        const personality = PERSONALITY.getCommands().gift;
        interactionReply(interaction, personality.help);
    },
};

export default gift;
