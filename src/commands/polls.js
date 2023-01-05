import { SlashCommandBuilder } from "@discordjs/builders";
import { PERSONALITY } from "../personality";
import {interactionReply} from "./utils.js";


const command = new SlashCommandBuilder()
    .setName(PERSONALITY.getCommands.polls.name)
    .setDescription(PERSONALITY.getCommands.polls.description)
    .setDefaultMemberPermissions(0x0000010000000000)
    .addStringOption((option) => 
      option
        .setName(PERSONALITY.getCommands.polls.titleOption.name)
        .setDescription(PERSONALITY.getCommands.polls.titleOption.description)
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(256)
    )
    .addStringOption((option) =>
      option
        .setName(PERSONALITY.getCommands.polls.choiceOption.name)
        .setDescription(PERSONALITY.getCommands.polls.choiceOption.description)
        .setRequired(true)
        .setMinLength(4)
    )
    .addBooleanOption((option) =>
      option
        .setName(PERSONALITY.getCommands.polls.hideOption.name)
        .setDescription(PERSONALITY.getCommands.polls.hideOption.description)
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName(PERSONALITY.getCommands.polls.voteOption.name)
        .setDescription(PERSONALITY.getCommands.polls.voteOption.description)
        .setRequired(false)
    )

const polls = {
    command,
    help: (interaction) => {
        const personality = PERSONALITY.getCommands().polls;
        interactionReply(interaction, personality.help);
    },
    admin: true,
    releaseDate: null,
    sentinelle: true,
}

export default polls;