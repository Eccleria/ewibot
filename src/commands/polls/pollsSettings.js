import { MessageActionRow, MessageSelectMenu } from "discord.js";
import {
  fetchPollMessage,
  interactionEditReply,
  pollRefreshEmbed,
} from "./pollsUtils.js";
import { createButton, isSentinelle } from "../utils.js";
import { PERSONALITY } from "../../personality.js";
import { getPoll, removePoll, resetPollVoters } from "../../helpers/index.js";
import { COMMONS } from "../../commons.js";

export const sendSettingsButtons = async (interaction) => {
  try {
    await interaction.deferReply({ ephemeral: true });
  } catch (e) {
    return console.log(e);
  }

  //get personality
  const perso = PERSONALITY.getCommands().polls.settings;

  //check for Sentinelle or author
  const pollMessage = interaction.message;
  const dbPoll = getPoll(interaction.client.db, pollMessage.id);
  if (!dbPoll) {
    interactionEditReply(interaction, perso.errorNoPoll);
    console.log(`Error poll not found : ${pollMessage.id}`);
    return;
  }

  if (interaction.user.id !== dbPoll.authorId) {
    //if not poll author, check is sentinelle
    const currentServer = COMMONS.fetchGuildId(interaction.guildId);
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
  const refreshButton = createButton(...bPerso.refresh, "PRIMARY"); // refresh poll embed
  const updateButton = createButton(...bPerso.update, "PRIMARY"); // update poll parameters
  const removeButton = createButton(...bPerso.remove, "PRIMARY"); // remove poll choices
  const resetButton = createButton(...bPerso.reset, "DANGER"); // reset poll votes
  const stopButton = createButton(...bPerso.stop, "DANGER"); //stop poll

  const firstButton = [updateButton, removeButton, resetButton, stopButton];

  //If stopped poll, disable most buttons
  if (pollEmbed.title.includes(perso.stop.title))
    firstButton.forEach((btn) => btn.setDisabled(true));
  const settingsButton = [refreshButton, ...firstButton];

  //create ActionRows
  const actionRow = new MessageActionRow().addComponents(settingsButton);

  //send buttons
  interactionEditReply(interaction, { components: [actionRow] });
};

export const stopPoll = async (interaction) => {
  try {
    await interaction.deferUpdate();
  } catch (e) {
    return console.log(e);
  }

  //get personality
  const perso = PERSONALITY.getCommands().polls.settings;

  //fetch pollMessage
  const pollMessage = await fetchPollMessage(interaction);
  const editedPollMessage = {};

  //edit title
  const pollEmbed = pollMessage.embeds[0];
  pollEmbed.title = pollEmbed.title + perso.stop.title;
  editedPollMessage.embeds = [pollEmbed];

  //remove polls buttons
  editedPollMessage.components = [];

  //edit poll message
  const editedStopMessage = {
    content: perso.stop.stopped,
    components: [],
    ephemeral: true,
  };
  interactionEditReply(interaction, editedStopMessage);
  pollMessage.edit(editedPollMessage);
};

export const removePollButtonAction = async (interaction) => {
  try {
    await interaction.deferUpdate();
  } catch (e) {
    return console.log(e);
  }

  const perso = PERSONALITY.getCommands().polls.settings.remove;

  //get poll from db
  const pollMessage = await fetchPollMessage(interaction);
  const dbPoll = getPoll(interaction.client.db, pollMessage.id);
  const maxToRemove = dbPoll.votes.length - 2;

  if (maxToRemove < 1)
    return interactionEditReply(interaction, {
      content: perso.errorNotEnoughToRemove,
      components: [],
    });

  //create selectMenu
  const menu = new MessageSelectMenu()
    .setCustomId(perso.customId)
    .setPlaceholder(perso.placeholder)
    .setMinValues(1)
    .setMaxValues(maxToRemove);

  //parse choices
  const fields = pollMessage.embeds[0].fields;
  const choices = fields.reduce((acc, cur, idx) => {
    const curChoice = { label: cur.name, value: "polls_" + idx.toString() }; // description: "Choix_" + idx.toString(),
    return [...acc, curChoice];
  }, []);
  menu.addOptions(choices);

  //send message
  const actionRow = new MessageActionRow().addComponents(menu);
  const payload = { components: [actionRow] };
  interactionEditReply(interaction, payload);
};

export const resetPollButtonAction = async (interaction) => {
  try {
    await interaction.deferUpdate();
  } catch (e) {
    return console.log(e);
  }

  //get data
  const personality = PERSONALITY.getCommands().polls;
  const perso = personality.settings.reset; //personality
  const pollMessage = await fetchPollMessage(interaction); //db data
  const embed = pollMessage.embeds[0];

  //reset db
  resetPollVoters(interaction.client.db, pollMessage.id);

  //reset embed
  const black = personality.black;
  const newFields = embed.fields.map((field) => {
    return { name: field.name, value: black.repeat(10) + " 0% (0)\n" };
  });
  embed.setFields(newFields);

  //update message
  const editedPollMessage = { embeds: [embed] }; //update embed
  editedPollMessage.components = pollMessage.components; //get old buttons
  pollMessage.edit(editedPollMessage); //update message

  const editedInteractionMessage = {
    content: perso.reset,
    components: [],
    ephemeral: true,
  };
  interactionEditReply(interaction, editedInteractionMessage);
};

export const updatePollButtonAction = async (interaction) => {
  try {
    await interaction.deferUpdate();
  } catch (e) {
    return console.log(e);
  }

  //get personality
  const perso = PERSONALITY.getCommands().polls.settings.update;

  //create selectMenu
  const selectMenu = new MessageSelectMenu()
    .setCustomId(perso.customId)
    .setPlaceholder(perso.placeholder)
    .setMaxValues(1);

  //parse choices
  const choices = perso.choices;
  selectMenu.addOptions(choices);

  //send message
  const actionRow = new MessageActionRow().addComponents(selectMenu);
  const payload = { components: [actionRow], ephemeral: true };
  interactionEditReply(interaction, payload);
};

export const refreshPollButtonAction = async (interaction) => {
  const perso = PERSONALITY.getCommands().polls; //personality
  const sPerso = perso.settings;
  await interaction.update({
    content: sPerso.refresh.underRefresh,
    ephemeral: true,
    components: [],
  });

  const pollMessage = await fetchPollMessage(interaction);
  const embed = pollMessage.embeds[0];
  const db = interaction.client.db;

  //disable actions during refresh
  const disabledComponents = pollMessage.components.reduce((acc, cur) => {
    cur.components.forEach((button) => button.setDisabled(true)); //disable buttons of cur actionRow
    return [...acc, cur];
  }, []);
  await pollMessage.edit({ components: disabledComponents });

  //update poll embed
  const dbPoll = getPoll(db, pollMessage.id);
  await pollRefreshEmbed(pollMessage, dbPoll, perso);

  //reply and enable votes
  interactionEditReply(interaction, {
    ephemeral: true,
    content: sPerso.refresh.done,
  });

  //handle buttons
  if (!embed.title.includes(sPerso.stop.title)) {
    //if poll not ended, add again all buttons as enabled
    const enabledComponents = pollMessage.components.reduce((acc, cur) => {
      cur.components.forEach((button) => button.setDisabled(false)); //disable buttons of cur actionRow
      return [...acc, cur];
    }, []);
    pollMessage.edit({ components: enabledComponents });
  } else {
    pollMessage.edit({ components: [] }); //else remove every button
    removePoll(db, pollMessage.id); //remove data from db
  }
};
