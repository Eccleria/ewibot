import { SlashCommandBuilder } from "@discordjs/builders";

import { PERSONALITY } from "../personality.js";

import { interactionReply } from "./utils.js"

const personality = PERSONALITY.getCommands();

const command = new SlashCommandBuilder()
  .setName("reverse");

const action = (interaction) => {
  const string = interaction.options.getString("contenu");
  if (string.length !== 0) {
    const reversed = string.rightReduce(())
  }
}

const reverse = {
  action,
  command,
  help: (interaction) => {
    interactionReply(interaction, personality.reverse.help)
  }
};

export default reverse;