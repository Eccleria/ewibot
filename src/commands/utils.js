import dayjs from "dayjs";

import { MessageButton } from "discord.js";
import { eventRolesButtonHandler } from "./eventRoles.js";
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
 * @param {?string} label Button label shown to user
 * @param {string} style Button style
 * @param {?string} emoji Emoji to add to button label
 * @returns {MessageButton}
 */
export const createButton = (id, label, style, emoji) => {
  const button = new MessageButton().setCustomId(id).setStyle(style);
  if (label) button.setLabel(label);
  if (emoji) button.setEmoji(emoji);
  return button;
};

/**
 * Dispatch button interaction between action functions (here gift and pronuns)
 * @param {object} interaction
 */
export const buttonHandler = (interaction) => {
  const { customId } = interaction;
  if (customId === "gift") giftButtonHandler(interaction);
  else if (customId.startsWith("announce")) 
    announceButtonHandler(interaction);
  else if (customId.startsWith("eventRole"))
    eventRolesButtonHandler(interaction);
  else if (interaction.customId.startsWith("pronouns"))
    pronounsButtonHandler(interaction);
  else interactionReply(interaction, "ERROR 404");
};

/**
 * Return if guildMember has Sentinelle role or not
 * @param {any} member guildMember to verify role
 * @param {any} currentServer current server data from commons.json
 * @returns {boolean}
 */
export const isSentinelle = (member, currentServer) => {
  const roles = member.roles.cache;
  return roles.has(currentServer.sentinelleRoleId);
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

const sliceEmbedContent = (len, string) => {
  const lenArray = Array.from(new Array(len));
  const sliced = lenArray.reduce((acc, _cur, idx) => {
    if (idx === len - 1) return [...acc, string.slice(idx * 1024)];
    const sliced = string.slice(idx * 1024, (idx + 1) * 1024);
    return [...acc, sliced];
  }, []); //slice content in less than 1024 characters
  return sliced;
};

export const dispatchSlicedEmbedContent = (content, embed, personality) => {
  const slice = Math.ceil(content.length / 1024); //get number of time to slice oldContent by 1024

  if (slice > 1) {
    //if need to slice
    const sliced = sliceEmbedContent(slice, content); //slice and add to embed

    sliced.forEach((str, idx) => {
      if (idx === 0)
        embed.addFields({
          name: personality.text,
          value: str,
        });
      //name's different from others
      else embed.addFields({ name: personality.textAgain, value: str });
    });
  } else embed.addFields({ name: personality.text, value: content });
};
