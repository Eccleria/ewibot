import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonStyle,
  EmbedBuilder,
  ButtonBuilder,
  MessageFlags,
} from "discord.js";
import {
  fetchPollMessage,
  interactionEditReply,
  pollRefreshEmbed,
  stopPoll,
} from "./pollsUtils.js";
import { createButton } from "../utils.js";
import { getPoll, isSentinelle, resetPollVoters } from "../../helpers/index.js";
import { COMMONS } from "../../classes/commons.js";
import { PERSONALITY } from "../../classes/personality.js";
import { logger } from "../../bot.js";

export const sendSettingsButtons = async (interaction) => {
  try {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  } catch (e) {
    return logger.error(e);
  }

  //get personality
  const perso = PERSONALITY.getPersonality().polls.settings;

  //check for Sentinelle or author
  const pollMessage = interaction.message;
  const dbPoll = getPoll(interaction.client.db, pollMessage.id);
  if (!dbPoll) {
    interactionEditReply(interaction, perso.errorNoPoll);
    logger.error(`Error poll not found : ${pollMessage.id}`);
    return;
  }

  if (interaction.user.id !== dbPoll.authorId) {
    //if not poll author, check is sentinelle
    const currentServer = COMMONS.fetchFromGuildId(interaction.guildId);
    if (!isSentinelle(interaction.member, currentServer)) {
      //if not, no right to use this button
      interactionEditReply(interaction, perso.errorNotAuthor);
      return;
    }
  }

  //fetch embed
  const pollEmbed = pollMessage.embeds[0];

  //create buttons
  const bPerso = perso.buttons;
  const pStyle = ButtonStyle.Primary;
  const dStyle = ButtonStyle.Danger;
  const refreshButton = createButton(...bPerso.refresh, pStyle); // refresh poll embed
  const updateButton = createButton(...bPerso.update, pStyle); // update poll parameters
  const removeButton = createButton(...bPerso.remove, pStyle); // remove poll choices
  const resetButton = createButton(...bPerso.reset, dStyle); // reset poll votes
  const stopButton = createButton(...bPerso.stop, dStyle); //stop poll

  const firstButton = [updateButton, removeButton, resetButton, stopButton];

  //If stopped poll, disable most buttons
  if (pollEmbed.data.title.includes(perso.stop.title))
    firstButton.forEach((btn) => btn.setDisabled(true));
  const settingsButton = [refreshButton, ...firstButton];

  //create ActionRows
  const actionRow = new ActionRowBuilder().addComponents(settingsButton);

  //send buttons
  interactionEditReply(interaction, { components: [actionRow] });
};

export const stopPollButtonAction = async (interaction) => {
  try {
    await interaction.deferUpdate();
  } catch (e) {
    return logger.error(e);
  }
  const db = interaction.client.db;

  //get data
  const perso = PERSONALITY.getPersonality().polls;
  const sPerso = perso.settings;
  const pollMessage = await fetchPollMessage(interaction);
  const dbPoll = getPoll(db, pollMessage.id);
  if (!dbPoll) {
    interactionEditReply(interaction, { content: perso.errorNoDb });
    return;
  }
  await stopPoll(dbPoll, pollMessage, sPerso, false);

  //edit poll message
  const editedStopMessage = {
    content: sPerso.stop.stopped,
    components: [],
    flags: MessageFlags.Ephemeral,
  };
  interactionEditReply(interaction, editedStopMessage);
};

export const removePollButtonAction = async (interaction) => {
  try {
    await interaction.deferUpdate();
  } catch (e) {
    return logger.error(e);
  }

  const perso = PERSONALITY.getPersonality().polls;
  const rPerso = perso.settings.remove;

  //get poll from db
  const pollMessage = await fetchPollMessage(interaction);
  const dbPoll = getPoll(interaction.client.db, pollMessage.id);
  if (!dbPoll) {
    interactionEditReply(interaction, { content: perso.errorNoDb });
    return;
  }
  const maxToRemove = dbPoll.votes.length - 2;

  if (maxToRemove < 1)
    return interactionEditReply(interaction, {
      content: rPerso.errorNotEnoughToRemove,
      components: [],
    });

  //create selectMenu
  const menu = new StringSelectMenuBuilder()
    .setCustomId(rPerso.customId)
    .setPlaceholder(rPerso.placeholder)
    .setMinValues(1)
    .setMaxValues(maxToRemove);

  //parse choices
  const fields = pollMessage.embeds[0].data.fields;
  const choices = fields.reduce((acc, cur, idx) => {
    const curChoice = {
      label: cur.name,
      value: perso.prefix + idx.toString(),
    }; // description: "Choix_" + idx.toString(),
    return [...acc, curChoice];
  }, []);
  menu.addOptions(choices);

  //send message
  const actionRow = new ActionRowBuilder().addComponents(menu);
  const payload = { components: [actionRow] };
  interactionEditReply(interaction, payload);
};

export const resetPollButtonAction = async (interaction) => {
  try {
    await interaction.deferUpdate();
  } catch (e) {
    return logger.error(e);
  }

  //get data
  const personality = PERSONALITY.getPersonality().polls;
  const perso = personality.settings.reset; //personality
  const pollMessage = await fetchPollMessage(interaction); //db data
  const pollEmbed = pollMessage.embeds[0];
  const embed = EmbedBuilder.from(pollEmbed);

  //reset db
  resetPollVoters(interaction.client.db, pollMessage.id);

  //reset embed
  const black = personality.black;
  const newFields = embed.data.fields.map((field) => {
    return { name: field.name, value: black.repeat(10) + " 0% (0)\n" };
  });
  embed.setFields(newFields);

  //update message
  const editedPollMessage = { embeds: [embed, ...pollMessage.embeds.slice(1)] }; //update embed
  editedPollMessage.components = pollMessage.components; //get old buttons
  pollMessage.edit(editedPollMessage); //update message

  const editedInteractionMessage = {
    content: perso.reset,
    components: [],
    flags: MessageFlags.Ephemeral,
  };
  interactionEditReply(interaction, editedInteractionMessage);
};

export const updatePollButtonAction = async (interaction) => {
  try {
    await interaction.deferUpdate();
  } catch (e) {
    return logger.error(e);
  }

  //get personality
  const perso = PERSONALITY.getPersonality().polls.settings.update;

  //create selectMenu
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(perso.customId)
    .setPlaceholder(perso.placeholder)
    .setMaxValues(1);

  //parse choices
  const choices = perso.choices;
  selectMenu.addOptions(choices);

  //send message
  const actionRow = new ActionRowBuilder().addComponents(selectMenu);
  const payload = { components: [actionRow], flags: MessageFlags.Ephemeral };
  interactionEditReply(interaction, payload);
};

export const refreshPollButtonAction = async (interaction) => {
  const perso = PERSONALITY.getPersonality().polls; //personality
  const sPerso = perso.settings;
  await interaction.update({
    content: sPerso.refresh.underRefresh,
    flags: MessageFlags.Ephemeral,
    components: [],
  });

  const pollMessage = await fetchPollMessage(interaction);
  const db = interaction.client.db;

  //disable actions during refresh
  const components = pollMessage.components;
  const disabledComponents = editButtonStatus(components);
  await pollMessage.edit({ components: disabledComponents });

  //update poll embed
  const dbPoll = getPoll(db, pollMessage.id);
  if (!dbPoll) interactionEditReply(interaction, { content: perso.errorNoDb });
  else {
    await pollRefreshEmbed(pollMessage, dbPoll);
    interactionEditReply(interaction, {
      content: sPerso.refresh.done,
    });
  }

  //enable buttons
  const enabledComponents = editButtonStatus(components, false);
  pollMessage.edit({ components: enabledComponents });
};

/**
 * Set new setDisabled status for buttons in given actionRows
 * @param {object[]} components List of ActionRows
 * @param {boolean} status new disabled status for buttons. default is true.
 * @returns List of ActionRows with edited buttons
 */
const editButtonStatus = (components, status = true) => {
  const edited = components.reduce((acc, cur) => {
    cur.components.forEach((button) =>
      ButtonBuilder.from(button).setDisabled(status),
    ); //set buttons status of cur actionRow
    return [...acc, cur];
  }, []);
  return edited;
};
