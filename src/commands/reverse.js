import dayjs from "dayjs";
import { SlashCommandBuilder, ContextMenuCommandBuilder } from "@discordjs/builders";

import { PERSONALITY } from "../personality.js";

import { interactionReply } from "./utils.js"

const reverseStr = (string) => {
  let reversed = "";
  for (const char of string) reversed = char + reversed;
  return reversed;
}

// SLASH COMMAND

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().reverse.name)
  .setDescription(PERSONALITY.getCommands().reverse.description)
  .addStringOption((option) =>
    option
      .setName(PERSONALITY.getCommands().reverse.stringOption.name)
      .setDescription(PERSONALITY.getCommands().reverse.stringOption.description)
      .setRequired(true)
  )
  .addBooleanOption((option) =>
    option
      .setName(PERSONALITY.getCommands().reverse.booleanOption.name)
      .setDescription(PERSONALITY.getCommands().reverse.booleanOption.description)
      .setRequired(false)
  );

const action = (interaction) => {
  const options = interaction.options;
  const personality = PERSONALITY.getCommands().reverse;
  const string = options.getString(personality.stringOption.name);
  const toCrossOut = options.getBoolean(personality.booleanOption.name);

  const reversed = reverseStr(string);
  const content = toCrossOut ? "`~~" + reversed + "~~`" : reversed;

  interactionReply(interaction, content);
};

const reverse = {
  action,
  command,
  help: (interaction) => {
    const personality = PERSONALITY.getCommands().reverse;
    interactionReply(interaction, personality.help)
  },
  admin: false,
  releaseDate: dayjs("12-08-2022", "MM-DD-YYYY"),
  sentinelle: false
};

// CONTEXT COMMAND

const contextCommand = new ContextMenuCommandBuilder()
  .setName(PERSONALITY.getCommands().reverseTranslator.name)
  .setType(3);

const contextAction = (interaction) => {
  const message = interaction.targetMessage; //get message
  const string = message.content; //get message content

  const reversed = reverseStr(string); //reverse message content
  const content = reversed.startsWith("~~") ? reversed.slice(2, -2) : reversed;

  interactionReply(interaction, content);
};

const reverseTranslator = {
  action: contextAction,
  command: contextCommand,
  help: (interaction) => {
    const personality = PERSONALITY.getCommands().reverseTranslator;
    interactionReply(interaction, personality.help)
  },
  admin: false,
  releaseDate: dayjs("12-16-2022", "MM-DD-YYYY"),
  sentinelle: false
}

export { reverse, reverseTranslator };