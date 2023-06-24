import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageEmbed } from "discord.js";

import { createButton, interactionReply } from "./utils.js";
import {
  addEventRole,
  getEventRoles,
  updateEventRoleMessageId,
} from "../helpers/index.js";
import { PERSONALITY } from "../personality.js";
import { COMMONS } from "../commons.js";

export const eventRolesButtonHandler = async (interaction) => {
  const { customId, guildId } = interaction;
  const personality = PERSONALITY.getCommands().eventRoles;
  const db = interaction.client.db;

  //get wanted role data
  const requestedEventRole = customId.split("_")[1];
  const currentEventServer = getEventRoles(db).find(
    (obj) => obj.guildId === guildId
  );
  const eventRoleId = currentEventServer[requestedEventRole + "RoleId"];

  //get alavirien role id
  const currentServer = COMMONS.fetchGuildId(guildId);

  //give requested role
  const guildMember = !interaction.member
    ? interaction.member
    : await interaction.member.fetch(); //get in cache new members
    
  if (
    guildMember &&
    guildMember.roles.cache.has(currentServer.alavirienRoleId)
  ) {
    if (!guildMember.roles.cache.has(eventRoleId)) {
      await guildMember.roles.add(eventRoleId);
      interactionReply(interaction, personality.role.added);
    } else {
      await guildMember.roles.remove(eventRoleId);
      interactionReply(interaction, personality.role.removed);
    }
  } else {
    interactionReply(interaction, personality.role.errorNotAlavirien);
  }
};

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
          .setName(PERSONALITY.getCommands().eventRoles.create.embedOption.name)
          .setDescription(
            PERSONALITY.getCommands().eventRoles.create.embedOption.description
          )
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

  const currentServer = COMMONS.fetchGuildId(interaction.guildId);

  const db = interaction.client.db;
  const buttonType = "PRIMARY";

  if (subcommand === personality.send.name) {
    //send subcommand
    const perso = personality.send; //get personality

    //setup embed
    const embed = new MessageEmbed()
      .setTitle(perso.embed.title)
      .setDescription(perso.embed.description)
      .setColor("NAVY")
      .addFields(perso.embed.fields);

    //setup buttons
    const pButton = perso.button;
    const CDLButton = createButton(
      ...pButton.CDL,
      buttonType,
      "822489141312618507"
    );
    const tournamentButton = createButton(
      ...pButton.tournament,
      buttonType,
      "⚔️"
    );
    const voiceButton = createButton(
      ...pButton.voice,
      buttonType,
      "841651539662995466"
    );
    const miscButton = createButton(
      ...pButton.misc,
      buttonType,
      "822479563077976065"
    );
    const components = [CDLButton, tournamentButton, voiceButton, miscButton];
    const actionRow = new MessageActionRow().addComponents(components);

    //get channel where to send
    const guild = await interaction.guild.fetch();
    const channel = await guild.channels.fetch(
      currentServer.eventRoleHandleChannelId
    );

    //send message
    const roleMessage = await channel.send({
      embeds: [embed],
      components: [actionRow],
    });
    updateEventRoleMessageId(db, interaction.guildId, roleMessage.id);
    interactionReply(interaction, perso.sent);
  } else if (subcommand === personality.create.name) {
    // create subcommand
    /*
    interactionReply(interaction, "En cours de développement");
    return;
    */

    //get data
    const currentEventServer = getEventRoles(db).find(
      ({ guildId }) => guildId === interaction.guildId
    );
    const guild = interaction.guild;
    const perso = personality.create;

    //get base role
    const roles = guild.roles; //roleManager
    const baseRole = roles.fetch(currentEventServer.baseRoleId);

    //get options
    const name = options.getString(perso.nameOption.name);
    const color = options.getString(perso.colorOption.name, false);
    const embedValue = options.getString(perso.embedOption.name);
    const slicedName = name.includes("<") ? name.split(">")[1] : name;

    //get role message
    const roleChannel = await interaction.guild.channels.fetch(
      currentServer.eventRoleHandleChannelId
    );
    const roleMessage = currentEventServer.roleMessageId
      ? await roleChannel.messages.fetch(currentEventServer.roleMessageId)
      : null;
    if (!roleMessage) {
      interactionReply(interaction, perso.errorNoRoleMessage);
      return;
    }

    //create new role
    const newRoleObj = {
      name: slicedName,
      permisions: baseRole.permisions,
      reason: `Demandé par ${interaction.member.toString()}`,
    };
    if (color) newRoleObj.color = color;
    const newRole = await roles.create(newRoleObj);
    const status = addEventRole(db, guild.id, newRole.name, newRole.id);
    console.log("status", status);

    //update embed
    const newField = { name: name, value: embedValue, inline: true };
    const embed = roleMessage.embeds[0];
    const fields = embed.fields;
    const blankNumber = embed.fields.reduce(
      (acc, cur) => acc + Number(cur.name === "\u200b"),
      0
    );
    const newFieldsNumber = fields.length - blankNumber;
    const fieldsToAdd =
      newFieldsNumber % 2
        ? [newField]
        : [{ name: "\u200b", value: "\u200b" }, newField];
    embed.addFields(fieldsToAdd);

    //create new button
    const emoteId = name.includes("<") ? name.split(">")[0] : null;
    const newButton = createButton(
      "eventRole_" + slicedName,
      slicedName,
      buttonType,
      emoteId
    );

    //create new vote buttons + regroup with olders
    const oldComponents = roleMessage.components;
    const lastARSize =
      oldComponents[oldComponents.length - 1].components.length;
    const newComponents =
      lastARSize === 5
        ? [...oldComponents, new MessageActionRow().addComponents(newButton)]
        : [
            ...oldComponents.slice(0, -1),
            oldComponents[oldComponents.length - 1].addComponents(newButton),
          ];

    //edit message
    const status2 = await roleMessage.edit({
      embeds: [embed],
      components: newComponents,
    });

    //reply to interaction
    if (status && status2) interactionReply(interaction, "c'est bon");
    else interactionReply(interaction, perso.errorGeneral);
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
