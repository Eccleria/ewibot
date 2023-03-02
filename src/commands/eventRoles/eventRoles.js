import { SlashCommandBuilder } from "@discordjs/builders";

import { interactionReply } from "../utils.js";
import { PERSONALITY } from "../../personality.js";

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().eventRoles.name)
  .setDescription(PERSONALITY.getCommands().eventRoles.description)
  .setDefaultMemberPermissions(0x0000010000000000)
  .addSubcommand((command) =>
    command //send
      .setName(PERSONALITY.getCommands().eventRoles.send.name)
      .setDescription(PERSONALITY.getCommands().eventRoles.send.description)
  )
  .addSubcommand((command) =>
    command
      .setName(PERSONALITY.getCommands().eventRoles.create.description)
      .setDescription(PERSONALITY.getCommands().eventRoles.create.description)
      .addStringOption((option) =>
        option
          .setName(PERSONALITY.getCommands().eventRoles.create.nameOption.name)
          .setDescription(
            PERSONALITY.getCommands().eventRoles.create.nameOption.description
          )
          .setMinLength(2)
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName(PERSONALITY.getCommands().eventRoles.create.colorOption.name)
          .setDescription(
            PERSONALITY.getCommands().eventRoles.create.colorOption.description
          )
          .setChoices(
            PERSONALITY.getCommands().eventRoles.create.colorOption.choices
          )
          .setRequired(false)
      )
  );

const action = async (interaction) => {
  const personality = PERSONALITY.getCommands().eventRoles;
  const options = interaction.options;
  const subcommand = options.getSubcommand();

  if (subcommand === personality.send.name) {
    const perso = personality.send;
    interactionReply(interaction, perso.sent);
  } else if (subcommand === personality.create.name) {
    // create subcommand
    const guild = interaction.guild;
    const roles = guild.roles; //roleManager
    const role = roles.fetch("959360675451383828");
    const perso = personality.create;

    //get options
    const name = options.getString(perso.nameOption.name);
    const color = options.getString(perso.colorOption.name, false);

    //create new role
    const newRoleObj = {
      name: name,
      permisions: role.permisions,
      reason: `Comme demandé par ${interaction.member.toString()}.`,
    };
    if (color) newRoleObj.color = color;
    const newRole = await roles.create(newRoleObj);
    console.log("newRole", newRole);
  }
};

const eventRoles = {
  // Allows Ewibot to send event roles message and update it
  name: "eventRoles",
  command: command,
  action,
  help: (interaction) => {
    interactionReply(interaction, PERSONALITY.getCommands().eventRoles.help);
  },
  admin: true,
  releaseDate: null,
  sentinelle: false,
  subcommands: [],
};

export default eventRoles;
