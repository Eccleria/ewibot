import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageEmbed } from "discord.js";

import { EVENTCOMMONS } from "./eventCommons.js";
import { createButton, interactionReply } from "../utils.js";
import { PERSONALITY } from "../../personality.js";

// json import
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));

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

    //setup embed
    const embed = new MessageEmbed()
      .setTitle(perso.embed.title)
      .setDescription(perso.embed.description)
      .setColor("NAVY")
    
    //setup buttons
    const CDLButton = createButton("eventRole_CDL", "CDL", "PRIMARY", "822489141312618507");
    const tournamentButton = createButton("eventRole_tournament", "Tournois", "PRIMARY", "⚔️");
    const voiceButton = createButton("eventRole_voiceChannel", "Vocal", "PRIMARY", "841651539662995466");
    const miscButton = createButton("eventRole_misc", "Divers", "PRIMARY", "822479563077976065");
    const components = [CDLButton, tournamentButton, voiceButton, miscButton];
    const actionRow = new MessageActionRow().addComponents(components);

    //get channel where to send    
    const currentServer = commons.find(({ guildId }) => guildId === interaction.guildId);
    const guild = await interaction.guild.fetch();
    const channel = await guild.channels.fetch(currentServer.eventRoleHandleChannelId);

    //send message
    await channel.send({embeds: [embed], components: [actionRow]});
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
