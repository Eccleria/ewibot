import dayjs from "dayjs";

import { MessageButton } from "discord.js";
import { pronounsButtonHandler } from "../admin/pronouns.js";
import { announceButtonHandler } from "./announce.js";
import { giftButtonHandler } from "./gift.js";

/**
 * Reply to interaction function
 * @param {any} interaction Interaction the function is replying to.
 * @param {string} content Content of the replying message.
 * @param {boolean} [isEphemeral] Send *ephemeral or not* message, true by default.
 */
export const interactionReply = async (
  interaction,
  content,
  isEphemeral = true
) => {
  await interaction.reply({ content: content, ephemeral: isEphemeral });
};

/**
 * Create a button from MessageButton
 * @param {string} id Button id for recognition
 * @param {string} label Button label shown to user
 * @param {string} style Button style
 * @returns {MessageButton}
 */
export const createButton = (id, label, style) => {
  return new MessageButton().setCustomId(id).setLabel(label).setStyle(style);
};

/**
 * Dispatch button interaction between action functions (here gift and pronuns)
 * @param {object} interaction
 */
export const buttonHandler = (interaction) => {
  if (interaction.customId === "gift") giftButtonHandler(interaction);
  else if (interaction.customId.startsWith("announce")) announceButtonHandler(interaction)
  else pronounsButtonHandler(interaction);
};

/**
 * Return if guildMember has Sentinelle role or not
 * @param {any} member guildMember to verify role
 * @param {any} currentServer current server data from commons.json
 * @returns {boolean}
 */
export const isSentinelle = async (member, currentServer) => {
  const roles = member.roles.cache;
  return roles.has(currentServer.sentinelleRoleId)
};

/**
 * Return if command has been released or not
 * @param {object} command
 * @returns {boolean}
 */
export const isReleasedCommand = (command) => {
  const day = dayjs();
  if (command.releaseDate) return command.releaseDate.diff(day) <= 0;
  else return true;
};