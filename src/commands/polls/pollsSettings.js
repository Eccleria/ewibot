import { MessageActionRow, MessageSelectMenu } from "discord.js";
import { fetchPollMessage, interactionEditReply } from "./pollsUtils.js";
import { createButton, isSentinelle } from "../utils.js";
import { PERSONALITY } from "../../personality.js";
import { getPoll, resetPollVoters } from "../../helpers/index.js";
import { COMMONS } from "../../commons.js";

export const sendSettingsButtons = async (interaction) => {
  console.log("sendSettingsButtons");
  await interaction.deferReply({ ephemeral: true });

  //get personality
  const perso = PERSONALITY.getCommands().polls.settings;

  //check for Sentinelle or author
  const pollMessage = interaction.message;
  const dbPoll = getPoll(interaction.client.db, pollMessage.id);
  if (!interaction.user.id === dbPoll.authorId) {
    const currentServer = COMMONS.fetchGuildId(interaction.guildId);
    if (!isSentinelle(interaction.member, currentServer)) {
      interactionEditReply(interaction, perso.errotNotAuthor);
    }
  }

  //fetch embed
  const pollEmbed = pollMessage.embeds[0];

  //create refresh button
  const refreshButton = createButton("polls_set_refresh", "Actualiser", "PRIMARY");
  if (pollEmbed.title.includes(perso.disable.title))
    refreshButton.setDisabled(true);

  //create update button
  const updateButton = createButton("polls_set_update", "Modifier", "PRIMARY");
  if (pollEmbed.title.includes(perso.disable.title))
    updateButton.setDisabled(true);

  //create remove button
  const removeButton = createButton("polls_set_remove", "Retirer", "PRIMARY");
  if (pollEmbed.title.includes(perso.disable.title))
    removeButton.setDisabled(true);

  //create reset button
  const resetButton = createButton("polls_set_reset", "RAZ", "DANGER");
  if (pollEmbed.title.includes(perso.disable.title))
    resetButton.setDisabled(true);

  //create stop button
  const stopButton = createButton("polls_set_disable", "Stop", "DANGER");
  if (pollEmbed.title.includes(perso.disable.title))
    stopButton.setDisabled(true);

  //create ActionRows
  const actionRow = new MessageActionRow().addComponents([
    refreshButton,
    updateButton,
    removeButton,
    resetButton,
    stopButton,
  ]);

  //send buttons
  interactionEditReply(interaction, { components: [actionRow] });
};

export const disablePoll = async (interaction) => {
  console.log("disablePoll");
  await interaction.deferUpdate();

  //get personality
  const perso = PERSONALITY.getCommands().polls.settings;

  //fetch pollMessage
  const pollMessage = await fetchPollMessage(interaction);
  const editedPollMessage = {};

  //edit title
  const pollEmbed = pollMessage.embeds[0];
  pollEmbed.title = pollEmbed.title + perso.disable.title;
  editedPollMessage.embeds = [pollEmbed];

  //edit poll buttons
  const components = pollMessage.components;
  const lastActionRow = components[components.length - 1];
  const settingButton =
    lastActionRow.components[lastActionRow.components.length - 1];
  const newActionRow = new MessageActionRow().addComponents(settingButton);
  editedPollMessage.components = [newActionRow];

  //edit poll message
  const editedStopMessage = {
    content: perso.disable.disabled,
    components: [],
    ephemeral: true,
  };
  interactionEditReply(interaction, editedStopMessage);
  pollMessage.edit(editedPollMessage);
};

export const removePollButtonAction = async (interaction) => {
  await interaction.deferUpdate();

  const perso = PERSONALITY.getCommands().polls.settings.remove;

  //get poll from db
  const pollMessage = await fetchPollMessage(interaction);
  const dbPoll = getPoll(interaction.client.db, pollMessage.id);
  const maxToRemove = dbPoll.votes.length - 2;

  if (maxToRemove < 1)
    return interactionEditReply(interaction, perso.errorNotEnoughToRemove);

  //create selectMenu
  const menu = new MessageSelectMenu()
    .setCustomId("polls_selectMenu_remove")
    .setPlaceholder("Choix des options à supprimer")
    .setMinValues(1)
    .setMaxValues(maxToRemove);

  //parse choices
  const fields = pollMessage.embeds[0].fields;
  const choices = fields.reduce((acc, cur, idx) => {
    const curChoice = { label: cur.name, value: idx.toString() }; // description: "Choix_" + idx.toString(),
    return [...acc, curChoice];
  }, []);
  menu.addOptions(choices);

  //send message
  const actionRow = new MessageActionRow().addComponents(menu);
  const payload = { components: [actionRow] };
  interactionEditReply(interaction, payload);
};

export const resetPollButtonAction = async (interaction) => {
  await interaction.deferUpdate();

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
  console.log("newFields", newFields);
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
  console.log("updatePollButtonAction");
  await interaction.deferUpdate();

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
