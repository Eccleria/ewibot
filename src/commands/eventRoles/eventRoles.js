import { SlashCommandBuilder } from "@discordjs/builders";

import { interactionReply } from "../utils.js";
import { PERSONALITY } from "../../personality";

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().eventRoles.name)
  .setDescription(PERSONALITY.getCommands().eventRoles.description)
  .setDefaultMemberPermissions(0x0000010000000000)
  .addSubcommand((command) => 
    command
      .setName(PERSONALITY.getCommands().eventRoles.send.name)
      .setDescription(PERSONALITY.getCommands().eventRoles.send.description)
  );

const action = (interaction) => {
  const personality = PERSONALITY.getCommands().eventRoles;
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === personality.send.name) {
    const perso = personality.send;
    interactionReply(interaction, perso.sent);
  }
};

const eventRoles = {
  // Allows Ewibot to send event roles message and update it
  name: "eventRoles",
  command: command,
  action,
  help: (interaction) => {
    interactionReply(interaction, PERSONALITY.getCommands().announce.help);
  },
  admin: true,
  releaseDate: null,
  sentinelle: false,
  subcommands: [],
};

export default eventRoles;