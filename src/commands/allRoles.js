import { SlashCommandBuilder } from "@discordjs/builders";
import {
  ActionRowBuilder,
  EmbedBuilder,
  ButtonStyle,
  Colors,
} from "discord.js";
import {
  channelSend,
  fetchChannel,
  fetchGuild,
  fetchMember,
  interactionReply,
} from "ewilib";

import { createButton } from "./utils.js";
import { COMMONS } from "../classes/commons.js";
import { PERSONALITY } from "../classes/personality.js";

export const allRolesButtonHandler = async (interaction) => {
  const { client, customId, guildId, member, user } = interaction;
  const personality = PERSONALITY.getPersonality().allRoles;
  const perso = personality.role;

  const commons = COMMONS.fetchFromGuildId(guildId);
  const roleName = customId.split("_")[1];
  const allRoleId = commons.allRoles[roleName];

  //give requested role
  const guild = await fetchGuild(client, guildId);
  const guildMember = !member
    ? member
    : await fetchMember(guild.members, user.id); //get in cache new members

  if (guildMember) {
    if (!guildMember.roles.cache.has(allRoleId)) {
      await guildMember.roles.add(allRoleId);
      interactionReply(interaction, perso.added);
    } else {
      await guildMember.roles.remove(allRoleId);
      interactionReply(interaction, perso.removed);
    }
  } else {
    interactionReply(interaction, perso.errorCantFetchMember);
  }
};

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getPersonality().allRoles.name)
  .setDescription(PERSONALITY.getPersonality().allRoles.description)
  .setDefaultMemberPermissions(0x0000010000000000);

const action = async (interaction) => {
  const perso = PERSONALITY.getPersonality().allRoles;
  const currentServer = COMMONS.fetchFromGuildId(interaction.guildId);

  const buttonType = ButtonStyle.Primary;

  //setup embed
  const embed = new EmbedBuilder()
    .setTitle(perso.embed.title)
    .setDescription(perso.embed.description)
    .setColor(Colors.DarkVividPink)
    .addFields(perso.embed.fields);

  //setup buttons
  const pButton = perso.button;
  const LCButton = createButton(
    ...pButton.LC,
    buttonType,
    "822489141312618507",
  );
  const actuButton = createButton(
    ...pButton.actus,
    buttonType,
    "827160847017050132",
  );
  const components = [actuButton, LCButton];
  const actionRow = new ActionRowBuilder().addComponents(components);

  //get channel where to send
  const guild = await interaction.guild.fetch();
  const channel = await fetchChannel(
    guild.channels,
    currentServer.eventRoleHandleChannelId,
  );

  //send message
  await channelSend(channel, {
    embeds: [embed],
    components: [actionRow],
  });
  interactionReply(interaction, perso.sent);
};

const allRoles = {
  // Allows Ewibot to send all roles message
  command: command,
  action,
  help: (interaction) => {
    interactionReply(interaction, PERSONALITY.getPersonality().allRoles.help);
  },
  admin: true,
  releaseDate: null,
  sentinelle: false,
  subcommands: ["all-roles"],
};

export default allRoles;
