import { SlashCommandBuilder, ContextMenuCommandBuilder } from "@discordjs/builders";

import { PERSONALITY } from "../personality.js";

import { interactionReply } from "./utils.js"

const personality = PERSONALITY.getCommands();

const reverseStr = (string) => {
  let reversed = "";
  for (const char of string) reversed = char + reversed;
  return reversed;
}

const command = new SlashCommandBuilder()
  .setName("reverse")
  .setDescription("Permet de vous inverser le message que vous souhaitez.")
  .addStringOption((option) =>
    option
      .setName("contenu")
      .setDescription("Contenu du message à inverser.")
      .setRequired(true)
  )
  .addBooleanOption((option) =>
    option
      .setName("barrer")
      .setDescription("true si vous voulez barrer le message complet")
      .setRequired(false)
  );

const action = (interaction) => {
  const options = interaction.options;
  const string = options.getString("contenu");
  const toCrossOut = options.getBoolean("barrer");

  const reversed = reverseStr(string);
  const content = toCrossOut ? "`~~" + reversed + "~~`" : reversed;

  interactionReply(interaction, content);
};

const reverse = {
  action,
  command,
  help: (interaction) => {
    interactionReply(interaction, personality.reverse.help)
  }
};

const contextCommand = new ContextMenuCommandBuilder()
  .setName("reversed-translator")
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
    interactionReply(interaction, personality.reverseTranslator.help)
  }
}

export { reverse, reverseTranslator };