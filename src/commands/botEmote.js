import { SlashCommandBuilder } from "discord.js";
import { PERSONALITY } from "../personality.js";

const command = new SlashCommandBuilder()
    .setName(PERSONALITY.getCommands().botEmote.name)
    .setDescription(PERSONALITY.getCommands().botEmote.description)
    .setDefaultMemberPermissions(0x0000010000000000)
    .addStringOption((option) => 
      option
        .setName(PERSONALITY.getCommands().botEmote.messageOption.name)
        .setDescription(PERSONALITY.getCommands().botEmote.messageOption.description)
        .setRequired(true)
        .setMinLength(1)
    )
    .addStringOption((option) => 
      option
        .setName(PERSONALITY.getCommands().botEmote.emoteOption.name)
        .setDescription(PERSONALITY.getCommands().botEmote.emoteOption.description)
        .setRequired(true)
        .setChoices()
    )