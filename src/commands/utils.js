import { ButtonBuilder } from "discord.js";
import { pronounsButtonHandler } from "../admin/pronouns.js";
import { settingsButtonHandler } from "./polls/pollsHandlers.js";
import { pollSelectMenuHandler } from "./polls/pollsSelectMenu.js";
import { announceButtonHandler } from "./announce.js";
import { eventRolesButtonHandler } from "./eventRoles.js";
import { giftButtonHandler } from "./gift.js";
import { interactionReply } from "../helpers/index.js";
import { accountabilityButtonHandler, accountabilitySelectMenuHandler } from "../buddy.js";

/**
 * Create a button from ButtonBuilder
 * @param {string} id Button id for recognition
 * @param {?string} label Button label shown to user
 * @param {string} style Button style
 * @param {?string} emoji Emoji to add to button label
 * @returns {ButtonBuilder}
 */
export const createButton = (id, label, style, emoji) => {
  const button = new ButtonBuilder().setCustomId(id).setStyle(style);
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
  if (customId.startsWith("gift")) giftButtonHandler(interaction);
  else if (customId.startsWith("announce")) announceButtonHandler(interaction);
  else if (customId.startsWith("eventRole"))
    eventRolesButtonHandler(interaction);
  else if (customId.startsWith("polls_set")) settingsButtonHandler(interaction);
  else if (customId.startsWith("polls"))
    return; //poll vote buttons, handled in pollsCollectors.js
  else if (customId.startsWith("aBuddy")) accountabilityButtonHandler(interaction);
  else if (customId.startsWith("pronouns")) pronounsButtonHandler(interaction);
  else interactionReply(interaction, "ERROR 404");
};

/**
 * Dispatch selectMenu interactions between corresponding functions
 * @param {object} interaction
 */
export const selectMenuHandler = (interaction) => {
  const { customId } = interaction;
  console.log("menuHandler", customId);
  if (customId.startsWith("polls_selectMenu"))
    pollSelectMenuHandler(interaction);
  else if (customId.startsWith("aBuddy_selectMenu"))
    accountabilitySelectMenuHandler(interaction);
};
