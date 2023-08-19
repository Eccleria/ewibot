import { ActionRowBuilder, StringSelectMenuBuilder, ButtonStyle, EmbedBuilder, ButtonBuilder } from "discord.js";
import {
  fetchPollMessage,
  interactionEditReply,
  pollRefreshEmbed,
  stopPoll,
} from "./pollsUtils.js";
import { createButton, isSentinelle } from "../utils.js";
import { PERSONALITY } from "../../personality.js";
import { getPoll, resetPollVoters } from "../../helpers/index.js";
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
    return console.log(e);
  }
  const db = interaction.client.db;

  //get data
  const perso = PERSONALITY.getCommands().polls.settings;
  const pollMessage = await fetchPollMessage(interaction);
  const dbPoll = getPoll(db, pollMessage.id);

  await stopPoll(dbPoll, pollMessage, perso);

  //edit poll message
  const editedStopMessage = {
    content: perso.stop.stopped,
    components: [],
    ephemeral: true,
  };
  interactionEditReply(interaction, editedStopMessage);
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
  const menu = new StringSelectMenuBuilder()
    .setCustomId(perso.customId)
    .setPlaceholder(perso.placeholder)
    .setMinValues(1)
    .setMaxValues(maxToRemove);

  //parse choices
  const fields = pollMessage.embeds[0].data.fields;
  const choices = fields.reduce((acc, cur, idx) => {
    const curChoice = { label: cur.name, value: "polls_" + idx.toString() }; // description: "Choix_" + idx.toString(),
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
    return console.log(e);
  }

  //get data
  const personality = PERSONALITY.getCommands().polls;
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
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(perso.customId)
    .setPlaceholder(perso.placeholder)
    .setMaxValues(1);

  //parse choices
  const choices = perso.choices;
  selectMenu.addOptions(choices);

  //send message
  const actionRow = new ActionRowBuilder().addComponents(selectMenu);
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
  const db = interaction.client.db;

  //disable actions during refresh
  const disabledComponents = enableDisableButtons(pollMessage.components, false);
  await pollMessage.edit({ components: disabledComponents });

  //update poll embed
  const dbPoll = getPoll(db, pollMessage.id);
  await pollRefreshEmbed(pollMessage, dbPoll);

  //reply and enable votes
  interactionEditReply(interaction, {
    ephemeral: true,
    content: sPerso.refresh.done,
  });

  //handle buttons
  const enabledComponents = enableDisableButtons(pollMessage.components, false); //enable buttons of cur ActionRowBuilder

  pollMessage.edit({ components: enabledComponents });
};

const enableDisableButtons = (MActionRow, status) => {
  return MActionRow.reduce((acc, cur) => {
    //disable buttons of cur ActionRowBuilder
    const buttons = cur.components.reduce((acc, button) => {
      const newButton = ButtonBuilder.from(button);
      newButton.setDisabled(status);
      return [...acc, newButton];
    }, []); 

    //build new ActionRowBuilder
    const newActionRow = new ActionRowBuilder().addComponents(buttons);
    return [...acc, newActionRow];
  }, []);
}
