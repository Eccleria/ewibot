import { MessageButton } from "discord.js";
import { pronounsButtonHandler } from "../admin/pronouns.js";
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
  else pronounsButtonHandler(interaction);
};
