import { SlashCommandBuilder } from "@discordjs/builders";

import { EVENTCOMMONS } from "./eventCommons.js";
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
    command //create
      .setName(PERSONALITY.getCommands().eventRoles.create.name)
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
          .setChoices(...PERSONALITY.getColors().choices)
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
    const currentEventServer = EVENTCOMMONS.getCommons().find(({ guildId }) => guildId === interaction.guildId);
    const guild = interaction.guild;
    const perso = personality.create;

    //get base role
    const roles = guild.roles; //roleManager
    const baseRole = roles.fetch(currentEventServer.baseRoleId);

    //get options
    const name = options.getString(perso.nameOption.name);
    const color = options.getString(perso.colorOption.name, false);

    //create new role
    const newRoleObj = {
      name: name,
      permisions: baseRole.permisions,
      reason: `Demandé par ${interaction.member.toString()}`,
    };
    if (color) newRoleObj.color = color;
    const newRole = await roles.create(newRoleObj);
    EVENTCOMMONS.addRole(guild.id, newRole.name , newRole.id);
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
